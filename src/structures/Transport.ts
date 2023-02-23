import {
  AudioPlayer,
  // AudioPlayerError,
  AudioPlayerStatus,
  AudioResource,
  createAudioPlayer,
  createAudioResource,
  entersState,
  StreamType,
  VoiceConnection,
  VoiceConnectionState,
  VoiceConnectionStatus,
  VoiceConnectionDisconnectReason,
} from '@discordjs/voice';
import type { Track } from './Track';
import { createFFmpegStream, FFmpegStreamOptions } from '../stream';
import { wait, warn } from '../utils';

export class Transport {
  private readonly _player: AudioPlayer;
  private _currentResource: AudioResource<Track> | null = null;

  private readonly _connectionTimeout: number;
  private readonly _rejoinTimeout: number;

  public constructor(private readonly _connection: VoiceConnection, private readonly _opts?: TransportOptions) {
    // Set option defaults
    this._connectionTimeout = this._opts?.connectionTimeout ?? 10_000;
    this._rejoinTimeout = this._opts?.rejoinTimeout ?? 5_000;

    // Create an audio player for this transport.
    this._player = createAudioPlayer();

    // SECTION - Ugly event handlers start
    this._connection.on('stateChange', (prev, state) => {
      this._voiceStateChange(prev, state)
        .catch(() => {
          warn('Transport#_connection$stateChange Transport@_voiceStateChange@catch not being handled.', 'BlameDeveloper');
        });
    });
    // !SECTION - Ugly event handlers end

    // Subscribe the connection to the player for this transport.
    this._connection.subscribe(this._player);
  }

  private _waitingSignal = false;
  private async _voiceStateChange(_prev: VoiceConnectionState, state: VoiceConnectionState): Promise<unknown> {
    if (state.status === VoiceConnectionStatus.Destroyed) {
      // If the connection is destroyed we can murder this transport instance.
      return this.murder();
    }

    if (state.status === VoiceConnectionStatus.Disconnected) {
      // Bot has become disconnected from the channel.
      if (state.reason === VoiceConnectionDisconnectReason.WebSocketClose && state.closeCode === 4014)
        return this._untilReadyElseDestoy();

      // Otherwise we will try to reconnect
      if (this._connection.rejoinAttempts < 5) {
        await wait((this._connection.rejoinAttempts + 1) * this._rejoinTimeout);
        return this._connection.rejoin();
      }

      // Otherwise time to say bye bye ;-;
      return this._connection.destroy();
    }

    // If connection is attempting to establish.
    if (
      state.status === VoiceConnectionStatus.Connecting
        || state.status === VoiceConnectionStatus.Signalling
    ) {
      // If we are already waiting for ready signal return.
      if (this._waitingSignal) return;
      this._waitingSignal = true;

      // Name is self explaintory.
      await this._untilReadyElseDestoy();

      // Finally reset the signal for next use.
      return this._waitingSignal = false;
    }
  }

  /**
   * Waits until the current connection is ready for spocified connection timeout
   * otherwise it will destroy the current connection.
   */
  private async _untilReadyElseDestoy(): Promise<void> {
    try {
      // Wait for the bot to enter a ready state.
      await this.untilReady();
    } catch {
      // If we fail to enter a ready state by the given time and the connection is not destroyed
      // we want to destroy the voice connection.
      if (this._connection.state.status !== VoiceConnectionStatus.Destroyed)
        this._connection.destroy();
    }
  }

  /**
   * Waits until the current connection is ready. If fails to enter state by
   * connection timeout will throw error.
   * @returns 
   */
  public async untilReady(): Promise<VoiceConnection> {
    return entersState(this._connection, VoiceConnectionStatus.Ready, this._connectionTimeout);
  }

  /**
   * Whether this transport is still useable or not.
   */
  public get useable(): boolean {
    return this._connection.state.status !== VoiceConnectionStatus.Destroyed;
  }

  /**
   * If the transport is currently paused from playing set audio resource.
   */
  public get paused(): boolean {
    return this._player.state.status === AudioPlayerStatus.Paused
      || this._player.state.status === AudioPlayerStatus.AutoPaused;
  }

  /**
   * If the transport waiting for the audio resource to become readable.
   */
  public get buffering(): boolean {
    return this._player.state.status === AudioPlayerStatus.Buffering;
  }

  /**
   * If the transport is currently playing set audio resource.
   */
  public get playing(): boolean {
    return this._player.state.status === AudioPlayerStatus.Playing;
  }

  /**
   * If nothing is currently being played through transport.
   */
  public get idle(): boolean {
    return this._player.state.status === AudioPlayerStatus.Idle;
  }

  /**
   * Current playback time of the track in milliseconds.
   */
  public get seek(): number {
    return this._currentResource?.playbackDuration ?? 0;
  }

  /**
   * Used to get the AudioResource needed to stream from a track.
   * @param track Track to get stream for.
   * @returns
   */
  public async getStream(track: Track, options?: FFmpegStreamOptions): Promise<AudioResource<Track>> {
    // Get the Readable stream from the extractor.
    const streamingUrl = await track.extractor.stream(track);
    // Create FFmpeg stream from Readable stream from extractor.
    // TODO: Support filters etc etc.
    const pcm = createFFmpegStream(streamingUrl, options);

    // Return a new audio resource from above data.
    return createAudioResource(pcm, {
      metadata: track,
      inputType: StreamType.Raw,
      inlineVolume: false,
    });
  }

  // TODO: when audio resource is destroyed is read stream still reading
  // or is it fully destroyed too?

  /**
   * Plays a new track on through the transport. 
   * @param track Track to play
   * @returns 
   */
  public async play(track: Track, options?: FFmpegStreamOptions): Promise<this> {
    // Waits for the voice connection state to be ready.
    if (this._connection.state.status !== VoiceConnectionStatus.Ready)
      await this.untilReady();

    // Fetch stream with the track.
    const stream = await this.getStream(track, options);
    // Set the track as the current playing resource.
    this._currentResource = stream;

    // Start playing the current resource.
    this._player.play(this._currentResource);

    return this;
  }

  /**
   * Seeks whatever is currently playing to a certain duration.
   * @param seek Playback to seek to.
   * @remarks Because we are using FFmpeg and how our pcm functions we have to
   * currently create an entire new stream resource seeked to provided point.
   * This ultimately makes seeking somewhat slow. There is not much that can be done
   * at the moment.
   * @todo Use dsp pipeline to cache past chunks from readable to allow seeking
   * to a specfic point instantaneously.
   * @returns 
   */
  public async seekTo(seek: number): Promise<this> {
    if (!this._currentResource)
      return this;

    // This makes seeks a bit slow. Should probably cache readable streams until they are finished
    // if they are live streams no cache!!
    const newStream = await this.getStream(this._currentResource.metadata, {
      seek,
    });

    this._currentResource = newStream;
    this._player.play(this._currentResource);

    return this;
  }

  /**
   * Pauses the current track playing through transport.
   * @param interpolateSilence Default `true`, forces transport to play 5 packets of silence after pausing to prevent audio artifacts.
   * @returns 
   */
  public pause(interpolateSilence = true): boolean {
    return this._player.pause(interpolateSilence);
  }

  /**
   * Resumes the current paused track.
   * @returns 
   */
  public resume(): boolean {
    return this._player.unpause();
  }

  /**
   * Stops whatever the player is currently playing and transitions
   * transport into an idle state.
   * @returns 
   */
  public stop(): boolean {
    return this._player.stop();
  }

  /**
   * Completely destroys the transport and the active voice connection.
   * @returns
   */
  public murder(): boolean {
    if (this.useable) this._connection.destroy();
    return this.stop();
  }
}

export interface TransportOptions {
  connectionTimeout?: number;
  rejoinTimeout?: number;
}
