// Nest
import { Injectable } from '@nestjs/common';

// Types
import type {
  IGameUpdates,
  IUpdateMessage,
  IShot,
  IOnExplosion,
  IExplosion,
} from '../../models/models';

// Modules
import Users from './users/users';
import Shots from './weapon/shots';
import User from './users/user';

@Injectable()
export class Game {
  private _users!: Users;
  private _shots!: Shots;

  constructor() {
    this._users = new Users();
    this._shots = new Shots();
  }

  public getGameUpdates(): IGameUpdates {
    return this._returnGameUpdates();
  }

  public setNewPlayer(): IUpdateMessage {
    return this._users.setNewPlayer();
  }

  public updatePlayer(id: string): User {
    return this._users.updatePlayer(id);
  }

  public checkPlayerId(id: string): boolean {
    return this._users.checkPlayerId(id);
  }

  public onEnter(message: IUpdateMessage): void {
    this._users.onEnter(message);
  }

  public onReenter(message: IUpdateMessage): void {
    this._users.onReenter(message);
  }

  public onUpdateToServer(message: IUpdateMessage): void {
    this._users.onUpdateToServer(message);
  }

  public onShot(message: IShot): IShot {
    return this._shots.onShot(message);
  }

  public onUnshot(message: number): void {
    this._shots.onUnshot(message);
  }

  public onExplosion(message: IExplosion): IOnExplosion {
    return this._users.onExplosion(message);
  }

  public onSelfharm(message: IUpdateMessage): IUpdateMessage {
    return this._users.onSelfharm(message);
  }

  private _returnGameUpdates(): IGameUpdates {
    return {
      users: this._users.list,
      shots: this._shots.list,
    };
  }
}
