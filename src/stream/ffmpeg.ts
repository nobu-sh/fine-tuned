import { FFmpeg } from 'prism-media';

export interface FFmpegStreamOptions {
  fmt?: string;
  encoderArgs?: string[];
  seek?: number;
}

export function FFMPEG_ARGS(url: string, fmt?: string) {
  return [
    '-reconnect', '1',
    '-reconnect_streamed', '1',
    '-reconnect_delay_max', '5',
    '-i', url,
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', `${typeof fmt === 'string' ? fmt : 's16le'}`,
    '-ar', '48000',
    '-ac', '2'
  ];
}

export function createFFmpegStream(stream: string, options: FFmpegStreamOptions = {}): FFmpeg {
  // Get needed arguments based on fmt.
  const args = FFMPEG_ARGS(stream, options.fmt);

  // If user defined arguments push them.
  if (options.seek) args.unshift('-ss', String(options.seek));
  if (options.encoderArgs) args.push(...options.encoderArgs);

  // Create FFmpeg transcoder.
  const transcoder = new FFmpeg({ shell: false, args });

  // On stream close we want to destroy transcoder instance.
  transcoder.on('close', () => {
    console.log('closed');
    transcoder.destroy();
  });

  return transcoder;
}
