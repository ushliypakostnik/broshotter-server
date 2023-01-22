// Types
// import type { ISelf } from '@/models/modules';

// Modules
import Zombies from './npc/zombies';
import { IModule } from '../../../models/api';
import { ISelf } from '../../../models/modules';

export default class NPC {
  // Modules
  public zombies: Zombies;

  constructor() {
    // Modules
    this.zombies = new Zombies();
  }

  public init(): void {
    this.zombies.init();
  }

  public getState(ids: string[]): IModule {
    return {
      zombies: this.zombies.list.filter(
        (npc) => ids.includes(npc.id),
      ),
    };
  }

  public animate(self: ISelf): void {
    this.zombies.animate(self);
  }
}
