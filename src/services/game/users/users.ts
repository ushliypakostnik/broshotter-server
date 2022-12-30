// Nest
import { Injectable } from '@nestjs/common';

// Types
import { IUserBack, IUpdateMessage } from '../../../models/models';

// Modules
import User from './user';

// Utils
import Helper from '../../utils/helper';

@Injectable()
export default class Users {
  public list: User[];
  private _listBack: IUserBack[];

  private _item!: User | IUserBack;
  private _strind!: string;

  constructor() {
    this.list = [];
    this._listBack = [];
  }

  // Utils

  private _getUserById(id: string): User {
    return this.list.find(player => player.id === id);
  }

  private _getUserBackById(id: string): IUserBack {
    return this._listBack.find(player => player.id === id);
  }

  // Gameplay

  public setNewPlayer(): IUpdateMessage {
    // console.log('Users onOnConnect: ', message);
    this._strind = Helper.generatePlayerId();
    this._item = new User(this._strind);
    this.list.push(this._item as User);
    this._listBack.push({ id: this._strind, last: `${new Date}` });
    return { id: this._strind, updates: { name: null }};
  }

  public checkPlayerId(id: string): boolean {
    // console.log('Users checkPlayerId: ', id);
    return !!this.list.find(player => player.id === id);
  }

  public updatePlayer(id: string): void {
    // console.log('Users updatePlayer!');
    this._item = this._getUserBackById(id);
    this._item.last = `${new Date}`;
    console.log('Users updatePlayer!', this._item);
  }

  public onUpdateToServer(message: IUpdateMessage): void {
    // console.log('Users onUpdateToServer: ', message);
    this._item = this._getUserById(message.id);
    for (let property in message.updates) {
      this._item[property] = message.updates[property];
    }
  }
}
