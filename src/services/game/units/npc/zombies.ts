// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { ISelf } from '../../../../models/modules';
import type { IUnit } from '../../../../models/api';

// Constants
import { EmitterEvents } from '../../../../models/modules';

@Injectable()
export default class Zombies {
  public list: IUnit[];
  private _item!: IUnit;
  private _counter = 0;
  private _time = 0;
  private _START = {
    id: '',
    name: 'Zombie',
    health: 100,
    animation: 'idle',
    isFire: false,
    isOnHit: false,
    positionX: 0,
    positionY: 30,
    positionZ: 0,
    directionX: -0.7,
    directionY: 0,
    directionZ: 0.7,
  };

  constructor() {
    this.list = [];
  }

  private _getItemById(id: string) {
    return this.list.find((zombie) => zombie.id === id);
  }

  private _addUnit(self: ISelf): void {
    ++this._counter;
    this._item = {
      ...this._START,
      id: `NPC1/${this._counter}`,
    };
    this.list.push(this._item);

    // addNPC event emit
    self.emiiter.emit(EmitterEvents.addNPC, this._item);
  }

  public init(): void {
    // console.log('Zombies init');
  }

  public animate(self: ISelf): void {
    // console.log('Zombies animate');

    // Решение на создание нового зомби
    this._time += self.events.delta;
    if (this._time > 3) {;
      if (this._counter < (Number(process.env.MAX_ZOMBIE || 500)))
        this._addUnit(self);
      this._time = 0;
    }
  }
}
