// Nest
import { Injectable } from '@nestjs/common';

import Users from './users/users';

// Types
import { IGameState, IUser, TUpdateMessage } from '../../models/models';

@Injectable()
export class Game {
  private _users!: Users;

  constructor() {
    this._users = new Users();
  }

  public getGame(): IGameState {
    return this._returnState();
  }

  public addUser(): void {
    this._users.add();
  }

  public setUser(message: TUpdateMessage): void {
    this._users.set(message);
  }

  private _returnState(): IGameState {
    return {
      game: {
        users: this._users.list,
      },
    }
  }
}
