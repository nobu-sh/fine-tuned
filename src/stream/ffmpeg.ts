import type { Readable } from 'stream';
import { FFmpeg } from 'prism-media';

export function FFMPEG_ARGS_PIPED(fmt?: string) {
  return [
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', `${typeof fmt === 'string' ? fmt : 's16le'}`,
    '-ar', '48000',
    '-ac', '2'
  ];
}

export interface FFmpegStreamOptions {
  fmt?: string;
  encoderArgs?: string[];
}

export function createFFmpegStream(stream: Readable, options: FFmpegStreamOptions = {}): FFmpeg {
  // Get needed arguments based on fmt.
  const args = FFMPEG_ARGS_PIPED(options.fmt);

  // If user defined arguments push them.
  if (options.encoderArgs) args.push(...options.encoderArgs);

  // Create FFmpeg transcoder.
  const transcoder = new FFmpeg({ shell: false, args });

  // On stream close we want to destroy transcoder instance.
  transcoder.on('close', transcoder.destroy);

  // On stream error we want to also destroy the transcoder instance.
  stream.on('error', transcoder.destroy);

  // Pipe the readable stream to the transcoder.
  stream.pipe(transcoder);

  return transcoder;
}
