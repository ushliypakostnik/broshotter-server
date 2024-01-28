// Types
// @ts-ignore
import type { ISelf } from '../../../models/modules';
import type { IShot } from '../../../models/api';

// Modules
import Shots from './shots';

export default class Weapon {
  // Modules
  public shots: Shots;

  constructor() {
    // Modules
    this.shots = new Shots();
  }

  public onShot(message: IShot): IShot {
    return this.shots.onShot(message);
  }

  public onUnshot(message: number): string {
    return this.shots.onUnshot(message);
  }

  public onUnshotExplosion(message: number): void {
    this.shots.onUnshotExplosion(message);
  }
}
