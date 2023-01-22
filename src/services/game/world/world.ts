// Nest
import { Injectable } from '@nestjs/common';

// Types
import type {
  ILocations,
  ILocationsWorld,
  ILocationUsers,
  IPosition,
  ITree,
  IUpdateMessage,
} from '../../../models/api';
import type { ISelf } from '../../../models/modules';

// Constants
import { defaultLocation, MAP } from './config';
import { EmitterEvents } from '../../../models/modules';

// Utils
import Helper from '../../utils/helper';

@Injectable()
export default class World {
  public locations: ILocations;
  public design: ILocationsWorld;
  public array: ILocationUsers[];

  private _ids: string[];
  private _item: ILocationUsers;
  private _x: number;
  private _y: number;
  private _positions: IPosition[];
  private _position: IPosition;
  private _trees: ITree[];
  private _SIZE = 3; // количество "слоев" вокруг центральной локации
  private _helper: Helper;

  private _id: string;

  constructor() {
    this._ids = [];
    this._helper = new Helper();
    this.locations = {};
    this.design = {};
    this.array = [];
    for (let x = 0; x < this._SIZE * 2 + 1; ++x) {
      for (let y = 0; y < this._SIZE * 2 + 1; ++y) {
        const id = Helper.generateUniqueId(2, this._ids);
        this._ids.push(id);

        let config;
        const index = `${(y - this._SIZE).toString()}/${(
          x - this._SIZE
        ).toString()}`;
        if (Helper.isHasProperty(MAP, index)) config = MAP[index];
        else config = defaultLocation;

        this._trees = [];
        if (!(x === 0 && y === 0)) {
          this._positions = [];
          const number = Helper.randomInteger(0, 20);
          for (let n = 0; n < number; ++n) {
            this._position = this._helper.getUniqueRandomPosition(
              this._positions,
              0,
              0,
              20,
              (process.env.SIZE as unknown as number) * 0.5,
              true,
            );
            this._positions.push(this._position);
            this._trees.push({
              ...this._position,
              scale: Helper.randomInteger(3, 45),
              rotateX: Helper.randomInteger(-1, 15),
              rotateY: Helper.randomInteger(0, 360),
              rotateZ: Helper.randomInteger(-1, 15),
            });
          }
        }

        const location = {
          id,
          x: x - this._SIZE,
          y: y - this._SIZE,
        };
        this.locations[id] = {
          ...location,
          users: [],
          npc: [],
        };
        this.design[id] = {
          ...location,
          ...config,
          trees: this._trees,
        };
        this.array.push({ ...location, users: [], npc: [] });
      }
    }
  }

  public init(self: ISelf) {
    // addNPC event subscribe
    self.emiiter.on(EmitterEvents.addNPC, (npc) => {
      // console.log('World addNPC', npc);
      // TODO // TODO // TODO // TODO // TODO
      // TODO: Пока всех выставляем на -2 / -2
      this._id = this._getLocationIdByCoords(-2, -2);
      this._addNPCOnLocation(npc.id, this._id);
    });
  }

  public onReenter(message: IUpdateMessage): void {
    this._id = this._getLocationIdByUserId(message.id as string);
    this._removePlayerFromLocation(
      message.id as string,
      this._id,
    );
    // TODO // TODO // TODO // TODO // TODO
    // TODO: Пока всех выставляем на -2 / -2
    this._addPlayerOnLocation(
      message.id as string,
      this._getLocationIdByCoords(-2, -2),
    );
  }

  private _getLocationIdByCoords(x: number, y: number): string {
    return this.array.find(
      (location: ILocationUsers) => location.x === x && location.y === y,
    ).id;
  }

  private _getCoordsIdByLocationId(id: string): { x: number; y: number } {
    this._item = this.array.find(
      (location: ILocationUsers) => location.id === id,
    );
    return {
      x: this._item.x,
      y: this._item.y,
    };
  }

  private _getLocationIdByUserId(id: string): string {
    return (
      this.array.find((location: ILocationUsers) => location.users.includes(id))
        .id || ''
    );
  }

  private _addPlayerOnLocation(userId: string, locationId: string): void {
    this.locations[locationId].users.push(userId);
    this.array
      .find((location: ILocationUsers) => location.id === locationId)
      .users.push(userId);
  }

  private _addNPCOnLocation(NPCId: string, locationId: string): void {
    this.locations[locationId].npc.push(NPCId);
    this.array
      .find((location: ILocationUsers) => location.id === locationId)
      .npc.push(NPCId);
  }

  private _removePlayerFromLocation(userId: string, locationId: string): void {
    this.locations[locationId].users = this.locations[locationId].users.filter(
      (user) => user !== userId,
    );
    this._item = this.array.find((location) => location.id === locationId);
    this._item.users = this._item.users.filter((user) => user !== userId);
  }

  public setNewPlayer(id: string): string {
    console.log('World setNewPlayer', id);
    // TODO // TODO // TODO // TODO // TODO
    // TODO: Пока всех выставляем на -2 / -2
    this._id = this._getLocationIdByCoords(-2, -2);
    this._addPlayerOnLocation(id, this._id);
    return this._id;
  }

  public updatePlayer(id: string): string {
    this._id = this._getLocationIdByUserId(id);
    console.log('World updatePlayer', id, this._id);
    return this._id;
  }

  public onRelocation(message: IUpdateMessage): void {
    this._removePlayerFromLocation(
      message.id as string,
      message.location as string,
    );
    const coords: { x: number; y: number } = this._getCoordsIdByLocationId(
      message.location as string,
    );
    this._x = coords.x;
    this._y = coords.y;
    if (message.direction === 'right') this._x += 1;
    else if (message.direction === 'left') this._x -= 1;
    else if (message.direction === 'bottom') this._y += 1;
    else if (message.direction === 'top') this._y -= 1;

    if (Math.abs(this._x) > this._SIZE) {
      if (this._x > 0) this._x -= 1;
      else this._x += 1;
      this._x *= -1;
    }

    if (Math.abs(this._y) > this._SIZE) {
      if (this._y > 0) this._y -= 1;
      else this._y += 1;
      this._y *= -1;
    }
    this._addPlayerOnLocation(
      message.id as string,
      this._getLocationIdByCoords(this._x, this._y),
    );
    // console.log('World onRelocation', this.locations, this.array);
  }
}
