// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { ISelf } from '../../models/modules';
import type {
  IUpdateMessage,
  IShot,
  IOnExplosion,
  IExplosion,
  IUnit,
  IGameUpdates,
  ILocationUsers,
  IUnitsByLocations,
} from '../../models/api';

// Constants
import { EmitterEvents } from '../../models/modules';

// Modules
import Events from '../utils/events';
import World from './world/world';
import Users from './units/users';
import Weapon from './weapon/weapon';
import NPC from './units/npc';

@Injectable()
export default class Game {
  public world: World;
  public users: Users;
  public weapon: Weapon;
  public npc: NPC;

  private _events: Events;
  private _self: ISelf;

  private _user!: IUnit;
  private _units!: IUnitsByLocations;

  private _id!: string;
  private _ids!: string[];

  constructor() {
    const EventEmitter = require('events');
    this._events = new Events();
    this._self = {
      emiiter: new EventEmitter(),
      events: this._events,
      octrees: {},
      scene: {},
      unitsByLocations: {},
      units: {},
    };

    this.world = new World();
    this.users = new Users();
    this.weapon = new Weapon();
    this.npc = new NPC();

    this.world.init(this._self);

    this._self.unitsByLocations = this._getUnitsByLocations();
    // addNPC event subscribe
    this._self.emiiter.on(EmitterEvents.addNPC, (npc) => {
      this._self.unitsByLocations = this._getUnitsByLocations();
    });

    this._animate();
  }

  public getGameUpdates(location: string): IGameUpdates {
    return {
      users: this.users.list.filter((user) =>
        this.world.locations[location].users.includes(user.id),
      ),
      weapon: {
        shots: this.weapon.shots.list.filter(
          (shot) => shot.location === location,
        ),
      },
      npc: {
        zombies: this.npc.getIds(this.world.locations[location].npc).zombies,
      },
    };
  }

  private _getUnitsByLocations(): IUnitsByLocations {
    this._units = {};
    this.world.array.forEach((location: ILocationUsers) => {
      this._ids = this.world.locations[location.id].users.concat(
        this.world.locations[location.id].npc,
      );
      this._units[location.id] = this.users.listInfo
        .filter((unit) => this._ids.includes(unit.id))
        .concat(
          this.npc.zombies.listInfo.filter((unit) =>
            this._ids.includes(unit.id),
          ),
        );
    });
    // console.log('Game _getUnitsByLocations: ', this._units);
    return this._units;
  }

  public setNewPlayer(): IUpdateMessage {
    this._user = this.users.setNewPlayer(this._self);
    this._id = this.world.setNewPlayer(this._self, this._user.id as string);
    this._self.unitsByLocations = this._getUnitsByLocations();
    return {
      location: this._id,
      ...this._user,
    };
  }

  public updatePlayer(id: string): IUpdateMessage {
    this._user = this.users.updatePlayer(id);
    this._id = this.world.updatePlayer(id);
    return {
      location: this._id,
      ...this._user,
    };
  }

  public checkPlayerId(id: string): boolean {
    return this.users.checkPlayerId(id);
  }

  public checkUsers(): void {
    this.users.checkUsers();
  }

  public onEnter(message: IUpdateMessage): void {
    this.users.onEnter(this._self, message);
  }

  public onReenter(message: IUpdateMessage): void {
    this.users.onReenter(this._self, message);
    this.world.onReenter(this._self, message);
    this._self.unitsByLocations = this._getUnitsByLocations();
  }

  public onRelocation(message: IUpdateMessage): void {
    this.users.onRelocation(this._self, message);
    this.world.onRelocation(this._self, message);
    this._self.unitsByLocations = this._getUnitsByLocations();
  }

  public onUpdateToServer(message: IUpdateMessage): void {
    this.users.onUpdateToServer(this._self, message);
  }

  public onShot(message: IShot): IShot {
    return this.weapon.onShot(message);
  }

  public onUnshot(message: number): string {
    return this.weapon.onUnshot(message);
  }

  public onUnshotExplosion(message: number): void {
    return this.weapon.onUnshotExplosion(message);
  }

  public onExplosion(message: IExplosion): IOnExplosion {
    return this.users.onExplosion(message);
  }

  public onSelfharm(message: IUpdateMessage): IUpdateMessage {
    return this.users.onSelfharm(message);
  }

  private _animate(): void {
    this._events.animate();

    console.log('Game animate delta: ', this._self.events.delta, this.npc.zombies.list.length);

    this.npc.animate(this._self);
    this.users.animate(this._self);

    setTimeout(() => {
      this._animate();
    }, 0);
  }
}
