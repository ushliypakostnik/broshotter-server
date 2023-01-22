// Nest
import { Injectable } from '@nestjs/common';

// Three
import * as THREE from 'three';

// Types
import type { ISelf } from '../../models/modules';
import type {
  IUpdateMessage,
  IShot,
  IOnExplosion,
  IExplosion,
  IUnit,
  IGameUpdates,
} from '../../models/api';

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

  private _id!: string;

  constructor() {
    const EventEmitter = require('events');
    this._events = new Events();
    this._self = {
      emiiter: new EventEmitter(),
      events: this._events,
      octrees: {},
      octrees2: {},
      scene: new THREE.Scene(),
    };

    this.world = new World();
    this.users = new Users();
    this.weapon = new Weapon();
    this.npc = new NPC();

    this.world.init(this._self);

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
        zombies: this.npc.getState(this.world.locations[location].npc).zombies,
      },
    };
  }

  public setNewPlayer(): IUpdateMessage {
    this._user = this.users.setNewPlayer();
    this._id = this.world.setNewPlayer(this._user.id as string);
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
    this.users.onEnter(message);
  }

  public onReenter(message: IUpdateMessage): void {
    this.users.onReenter(message);
    this.world.onReenter(message);
  }

  public onUpdateToServer(message: IUpdateMessage): void {
    this.users.onUpdateToServer(message);
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

  public onRelocation(message: IUpdateMessage): void {
    this.users.onRelocation(message);
    this.world.onRelocation(message);
  }

  private _animate(): void {
    this._events.animate();
    this.npc.animate(this._self);
    this.weapon.animate(this._self);

    setTimeout(() => {
      this._animate();
    }, 0);
  }

}
