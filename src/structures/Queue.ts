import { Player } from './Player';

export class Queue extends Player {
  public readonly id: string;
  
  public constructor(id: string) {
    super();
    this.id = id;
  }

  public add() {
    void this;
  }

  public remove() {
    void this;
  }
}
