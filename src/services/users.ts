// Nest
import { Injectable } from '@nestjs/common';

// Types
import User from './user';

@Injectable()
export class Users {
  private _id: number;
  private _list: User[];

  constructor() {
    this._id = 0;
    this._list = [];
  }

  addUser(): number {
    ++this._id;
    const user = new User(this._id);
    this._list.push(user);
    console.log('New user: ', user.id);
    return this._id;
  }
}
