// Nest
import { Injectable } from '@nestjs/common';

// Math
import math3d from 'math3d';

// Types
import {
  IUserBack,
  IUpdateMessage,
  IOnExplosion,
  IExplosion,
} from '../../../models/api';

// Modules
import User from './user';

// Utils
import Helper from '../../utils/helper';

@Injectable()
export default class Users {
  public list: User[];
  public listBack: IUserBack[];
  public counter = 0;

  private _updates!: IUpdateMessage[];
  private _item!: User | IUserBack;
  private _strind!: string;
  private _math: math3d;
  private _v1!: math3d.Vector3;
  private _v2!: math3d.Vector3;

  private _START = {
    health: 100,
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
    this.listBack = [];

    this._math = require('math3d');
  }

  // Utils

  private _getUserById(id: string): User {
    return this.list.find((player) => player.id === id);
  }

  private _getUserBackById(id: string): IUserBack {
    return this.listBack.find((player) => player.id === id);
  }

  private _getIds() {
    return this.listBack.map((player) => {
      return player.id;
    });
  }

  // Gameplay

  public checkPlayerId(id: string): boolean {
    // console.log('Users checkPlayerId: ', id);
    return !!this.list.find((player) => player.id === id);
  }

  public setNewPlayer(): User {
    this._strind = Helper.generateUniqueId(4, this._getIds());
    this._item = new User(this._strind);
    this._item = {
      ...this._item,
      ...this._START,
    };
    this.list.push(this._item as User);
    const date = new Date();
    const time = Helper.getUnixtime(date);
    this.listBack.push({
      id: this._strind,
      last: date,
      unix: time,
      time: null,
      play: 0,
      counter: ++this.counter,
    });

    console.log('Users setNewPlayer', this._item);
    return this._item;
  }

  public updatePlayer(id: string): User {
    // console.log('Users updatePlayer!');
    // this._item = this._getUserBackById(id);
    // this._item.last = `${new Date()}`;

    this._item = this._getUserById(id);
    console.log('Users updatePlayer: ', this._item);
    return this._item;
  }

  private _removePlayer(id: string): void {
    this.list = this.list.filter((player) => player.id !== id);
    this.listBack = this.listBack.filter((player) => player.id !== id);
  }

  public onEnter(message: IUpdateMessage): void {
    console.log('Users onEnter: ', message);
    this._item = this._getUserById(message.id as string);
    if (this._item) this._item.name = message.name as string;
    else {
      // Вот такая ситуация возможна только если сервер упал и перезапустился и мы "потеряли юзера"
      console.log('Users onEnter ERROR!!!');
      this._item = this.setNewPlayer();
      this._item.name = message.name as string;
    }
  }

  public onReenter(message: IUpdateMessage): void {
    console.log('Users onReenter: ', message);
    this._item = this._getUserById(message.id as string);
    this._item = {
      ...this._item,
      ...this._START,
    };
    this.list = this.list.filter((user) => user.id !== (message.id as string));
    this.list.push(this._item);
  }

  public onExplosion(message: IExplosion): IOnExplosion {
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
        // При попадании по коробке - ущерб в три раза сильнее
        // Если режим скрытый - в два раза меньше
        player.health +=
          (-1 / this._v1.distanceTo(this._v2)) *
          (player.id === message.enemy ? 15 : 5) *
          (player.animation.includes('hide') ? 0.5 : 1);
        this._updates.push({
          id: player.id,
          health: player.health,
          is: player.id === message.enemy,
        });
      }
      if (player.health < 0) player.animation = 'dead';
    });
    return {
      message,
      updates: this._updates,
    };
  }

  public onSelfharm(message: IUpdateMessage): IUpdateMessage {
    // console.log('Users onSelfharm: ', message);
    this._item = this._getUserById(message.id as string);
    this._item.health -= message.value as number;
    return {
      id: message.id,
      health: this._item.health,
    };
  }

  public onRelocation(message: IUpdateMessage): void {
    this._item = this._getUserById(message.id as string);

    if (message.direction === 'right' || message.direction === 'left')
      this._item.positionX *= -1;
    else if (message.direction === 'top' || message.direction === 'bottom')
      this._item.positionZ *= -1;

    this._v1 = new this._math.Vector3(
      this._item.positionX,
      0,
      this._item.positionZ,
    ).mulScalar(0.85);

    this._item.positionX = this._v1.x;
    this._item.positionY = 0;
    this._item.positionZ = this._v1.z;
  }

  public onUpdateToServer(message: IUpdateMessage): void {
    // console.log('Users onUpdateToServer: ', message);
    this._item = this._getUserById(message.id as string);
    if (this._item) {
      for (let property in message) {
        if (property != 'id') {
          if (property === 'time') {
            this._item = this._getUserBackById(message.id as string);
            this._item.time = message[property] as number;
            this._item.play = (this._item.time - this._item.unix) / 60;
          } else this._item[property] = message[property];
        }
      }
    }
  }

  public checkUsers(): void {
    const time = Helper.getUnixtime();
    this.listBack.forEach((player: IUserBack) => {
      if (time - player.time > 43200) this._removePlayer(player.id);
    });
  }
}
