// Nest
import { Injectable } from '@nestjs/common';

// Types
import type {
  IGameUpdates,
  IUpdateMessage,
} from '../../models/models';

// Modules
import Users from './users/users';

@Injectable()
export class Game {
  private _users!: Users;

  constructor() {
    this._users = new Users();
  }

  public getGameUpdates(): IGameUpdates {
    return this._returnGameUpdates();
  }

  public setNewPlayer(): IUpdateMessage {
    return this._users.setNewPlayer();
  }

  public updatePlayer(id: string): void {
    return this._users.updatePlayer(id);
  }

  public checkPlayerId(id: string): boolean {
    return this._users.checkPlayerId(id);
  }

  public onUpdateToServer(message: IUpdateMessage): void {
    this._users.onUpdateToServer(message);
  }

  private _returnGameUpdates(): IGameUpdates {
    return  {
      users: this._users.list.map((user) => {
        return {
          id: user.id,
          updates: { ...user },
        };
      }),
    };
  }
}
