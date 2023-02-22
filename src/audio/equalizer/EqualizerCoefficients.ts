export interface EqualizerCoefficientJSON {
  alpha: number;
  beta: number;
  gamma: number;
}

export class EqualizerCoefficients {
  public constructor(public beta: number, public alpha: number, public gamma: number) {}

  public setBeta(v: number): void {
    this.beta = v;
  }

  public setAlpha(v: number): void {
    this.alpha = v;
  }

  public setGamma(v: number): void {
    this.gamma = v;
  }

  public toJSON(): EqualizerCoefficientJSON {
    const { alpha, beta, gamma } = this;

    return { alpha, beta, gamma };
  }
}
