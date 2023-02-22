import { Queue } from './Queue';

export class QueueManager {
  private readonly _queues = new Map<string, Queue>();

  public constructor(private readonly _opts?: QueueManagerOptions) {
    void this._opts;
    return this;
  }

  /**
   * Gets a queue from the queues.
   * @param id Id of the queue.
   * @returns 
   */
  public get(id: string): Queue | undefined {
    return this._queues.get(id);
  }

  /**
   * Creates a new queue with the given id.
   * @param id Id of the queue.
   * @returns 
   */
  public create(id: string): Queue {
    // If there is a queue with that id already
    // we want to destroy it otherwise possible mem leak.
    const old = this._queues.get(id);
    if (old) old.destroy();

    // Create new queue.
    const q = new Queue(id);
    this._queues.set(id, q);
    return q;
  }

  /**
   * Gets an queue from the queues otherwise
   * creates one if it doesnt exist.
   * @param id Id of the queue.
   * @returns 
   */
  public getElseCreate(id: string): Queue {
    const old = this._queues.get(id);
    if (old) return old;

    return this.create(id);
  }

  /**
   * Attempts to remove a queue.
   * @param id Id of the queue.
   * @returns 
   */
  public remove(id: string): boolean {
    // If there is a queue with that id
    // we want to destroy it first.
    const old = this._queues.get(id);
    if (old) old.destroy();

    return this._queues.delete(id);
  }

  /**
   * Clears all active queues.
   */
  public clear(): void {
    this._queues.forEach(q => q.destroy());
    this._queues.clear();
  }

  /**
   * Destroys the queue manager (basically same as clear).
   */
  public destroy(): void {
    this.clear();
  }
};

export interface QueueManagerOptions {}
