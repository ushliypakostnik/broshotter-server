// Nest
import { Injectable } from '@nestjs/common';

// Types
import { TUpdateMessage } from '../../../models/models';

// Modules
import User from './user';

@Injectable()
export default class Users {
  private _id!: string;
  public list: User[];

  constructor() {
    this.list = [];
  }

  add(): void {
    this._id = `id--${Date.now()}`;
    const newUser = new User(this._id);
    this.list.push(newUser);
    // console.log('New user: ', this.list);
  }

  set(message: TUpdateMessage): void {
    console.log('Set user: ', message);
  }
}
