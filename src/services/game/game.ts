// Nest
import { Injectable } from '@nestjs/common';

// Types
import type {
  IGameUpdates,
  IUpdateMessage,
  IShot,
  IOnExplosion,
  IExplosion,
  IUser,
} from '../../models/models';

// Modules
import World from './world/world';
import Users from './users/users';
import Shots from './weapon/shots';

@Injectable()
export default class Game {
  public world!: World;
  public users!: Users;
  private _user!: IUser;
  private _shots!: Shots;
  private _usersOnLocation: string[];

  private _id!: string;
  private _message!: IUpdateMessage;

  constructor() {
    this.world = new World();
    this.users = new Users();
    this._shots = new Shots();
  }

  public getGameUpdates(location: string): IGameUpdates {
    this._usersOnLocation = this.world.locations[location].users;
    return {
      users: this.users.list.filter((user) =>
        this._usersOnLocation.includes(user.id),
      ),
      shots: this._shots.list.filter((shot) => shot.location === location),
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

  public onEnter(message: IUpdateMessage): void {
    this.users.onEnter(message);
  }

  public onReenter(message: IUpdateMessage): void {
    this.users.onReenter(message);
  }

  public onUpdateToServer(message: IUpdateMessage): void {
    this.users.onUpdateToServer(message);
  }

  public onShot(message: IShot): IShot {
    return this._shots.onShot(message);
  }

  public onUnshot(message: number): string {
    return this._shots.onUnshot(message);
  }

  public onUnshotExplosion(message: number): void {
    return this._shots.onUnshotExplosion(message);
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
}
