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

  add(): void {
    ++this._id;
    const newUser = new User(this._id);
    this._list.push(newUser);
    console.log('New user: ', this._list);
  }
}
