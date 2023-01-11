// Nest
import { Injectable } from '@nestjs/common';

// Math
import math3d from 'math3d';

// Types
import {
  IUserBack,
  IUpdateMessage,
  IOnExplosion,
} from '../../../models/models';

// Modules
import User from './user';

// Utils
import Helper from '../../utils/helper';

@Injectable()
export default class Users {
  public list: User[];
  private _listBack: IUserBack[];

  private _updates!: IUpdateMessage[];
  private _item!: User | IUserBack;
  private _strind!: string;
  private _math: math3d;
  private _v1!: math3d.Vector3;
  private _v2!: math3d.Vector3;

  private _START = {
    name: null,
    positionX: 0,
    positionY: 30,
    positionZ: 0,
    directionX: -0.7,
    directionY: 0,
    directionZ: 0.7,
  };

  constructor() {
    this.list = [];
    this._listBack = [];

    this._math = require('math3d');
  }

  // Utils

  private _getUserById(id: string): User {
    return this.list.find((player) => player.id === id);
  }

  private _getUserBackById(id: string): IUserBack {
    return this._listBack.find((player) => player.id === id);
  }

  // Gameplay

  public setNewPlayer(): IUpdateMessage {
    this._strind = Helper.generatePlayerId();
    this._item = new User(this._strind);
    this._item = {
      ...this._item,
      ...this._START,
    };
    this.list.push(this._item as User);
    this._listBack.push({ id: this._strind, last: `${new Date()}` });

    console.log('Users setNewPlayer', this._item);
    return { id: this._strind, name: null };
  }

  public checkPlayerId(id: string): boolean {
    // console.log('Users checkPlayerId: ', id);
    return !!this.list.find((player) => player.id === id);
  }

  public updatePlayer(id: string): User {
    // console.log('Users updatePlayer!');
    this._item = this._getUserBackById(id);
    this._item.last = `${new Date()}`;

    this._item = this._getUserById(id);
    return this._item;
  }

  public onEnter(message: IUpdateMessage): void {
    console.log('Users onEnter: ', message);
    this._item = this._getUserById(message.id as string);
    this._item.name = message.name as string;
  }

  public onReenter(message: IUpdateMessage): void {
    console.log('Users onReenter: ', message);
    this._item = this._getUserById(message.id as string);
    this._item = {
      ...this._item,
      ...this._START,
    }
  }

  public onExplosion(message: IUpdateMessage): IOnExplosion {
    // console.log('Users onExplosion!!!!!!!!!!!!!: ', message);
    this._updates = [];
    this.list.forEach((player: User) => {
      this._v1 = new this._math.Vector3(
        message.positionX,
        message.positionY,
        message.positionZ,
      );
      this._v2 = new this._math.Vector3(
        player.positionX,
        player.positionY,
        player.positionZ,
      );
      if (this._v1.distanceTo(this._v2) < 5) {
        player.health +=
          (-1 / this._v1.distanceTo(this._v2)) *
          (message.isOnEnemy ? 15 : 5) *
          (player.animation.includes('hide') ? 0.5 : 1);
        this._updates.push({
          id: player.id,
          health: player.health,
          is: message.isOnEnemy,
        });
      }
    });
    return {
      message,
      updates: this._updates,
    };
  }

  public onUpdateToServer(message: IUpdateMessage): void {
    // console.log('Users onUpdateToServer: ', message);
    this._item = this._getUserById(message.id as string);
    for (let property in message) {
      if (property != 'id') this._item[property] = message[property];
    }
  }
}
