const bass = (amount: number) => `bass=g=${amount}:f=110:w=0.3`;
export const AudioFilter = {
  BassBoost: bass,
  BassBoostLow: bass(15),
  BassBoostNormal: bass(20),
  BassBoostHigh: bass(30),
  '8D': 'apulsator=hz=0.09',
  VaporWave: 'aresample=48000,asetrate=48000*0.8',
  NightCore: 'aresample=48000,asetrate=48000*1.25',
  Phaser: 'aphaser=in_gain=0.4',
  Tremolo: 'tremolo',
  Vibrato: 'vibrato=f=6.5',
  Reverse: 'areverse',
  Treble: 'treble=g=5',
  NormalizerDos: 'dynaudnorm=g=101',
  Normalizer: 'acompressor',
  Surrounding: 'surround',
  Pulsator: 'apulsator=hz=1',
  SubBoost: 'asubboost',
  Karaoke: 'stereotools=mlev=0.03',
  Flanger: 'flanger',
  Gate: 'agate',
  Haas: 'haas',
  Mcompand: 'mcompand',
  Mono: 'pan=mono|c0=.5*c0+.5*c1',
  Mstlr: 'stereotools=mode=ms>lr',
  Mstrr: 'stereotools=mode=ms>rr',
  Compressor: 'compand=points=-80/-105|-62/-80|-15.4/-15.4|0/-12|20/-7.6',
  Expander: 'compand=attacks=0:points=-80/-169|-54/-80|-49.5/-64.6|-41.1/-41.1|-25.8/-15|-10.8/-4.5|0/0|20/8.3',
  SoftLimiter: 'compand=attacks=0:points=-80/-80|-12.4/-12.4|-6/-8|0/-6.8|20/-2.8',
  Chorus: 'chorus=0.7:0.9:55:0.4:0.25:2',
  Chorus2D: 'chorus=0.6:0.9:50|60:0.4|0.32:0.25|0.4:2|1.3',
  Chorus3D: 'chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3',
  FadeIn: 'afade=t=in:ss=0:d=10',
  Dim: 'afftfilt="\'real=re * (1-clip((b/nb)*b,0,1))\':imag=\'im * (1-clip((b/nb)*b,0,1))\'"',
  EarRape: 'channelsplit,sidechaingate=level_in=64'
};