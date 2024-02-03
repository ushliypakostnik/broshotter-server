import * as THREE from 'three';

// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { ISelf } from '../../../models/modules';
import {
  IUserBack,
  IUpdateMessage,
  IExplosion,
  IUnitInfo,
  IUnit,
} from '../../../models/api';

// Modules
import User from './user';

// Utils
import Helper from '../../utils/helper';

@Injectable()
export default class Users {
  public list: User[];
  public listBack: IUserBack[];
  public listInfo: IUnitInfo[];
  public counter = 0;

  private _updates!: IUpdateMessage[];
  private _item!: User;
  private _itemBack!: IUserBack;
  private _itemInfo!: IUnitInfo;
  private _strind!: string;
  private _v1!: THREE.Vector3;
  private _v2!: THREE.Vector3;
  private _mesh!: THREE.Mesh;
  private _date!: Date;
  private _time!: number;
  private _self!: number;

  private _START = {
    health: 100,
    name: null,
    positionX: 0,
    positionY: 20,
    positionZ: 0,
    directionX: -0.7,
    directionY: 0,
    directionZ: 0.7,
    animation: 'jump',
    isSleep: false,
  };

  constructor() {
    this.list = [];
    this.listBack = [];
    this.listInfo = [];
  }

  // Utils

  public getList(): IUnit[] {
    return this.list;
  }

  private _getUserById(id: string): User {
    return this.list.find((player) => player.id === id);
  }

  private _getUserInfoById(id: string): IUnitInfo {
    return this.listInfo.find((player) => player.id === id);
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

  public setNewPlayer(self: ISelf): User {
    this._strind = Helper.generateUniqueId(4, this._getIds());
    this._item = new User(this._strind);
    this._item = {
      ...this._item,
      ...this._START,
    };
    this.list.push(this._item as User);
    this._date = new Date();
    this._time = Helper.getUnixtime(this._date);
    this.listBack.push({
      id: this._strind,
      last: this._date,
      unix: this._time,
      time: null,
      play: 0,
      counter: ++this.counter,
    });

    // Добавляем коробку
    this._mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.8, 0.75),
      new THREE.MeshBasicMaterial(),
    );
    this.listInfo.push({
      id: this._item.id,
      mesh: this._mesh.uuid,
      animation: this._item.animation,
    });
    self.scene[this._item.id] = this._mesh;

    console.log('Users setNewPlayer', this._item);
    return this._item;
  }

  public updatePlayer(id: string): User {
    this._item = this._getUserById(id);
    console.log('Users updatePlayer: ', this._item);
    return this._item;
  }

  private _removePlayer(id: string): void {
    console.log('Users _removePlayer!!!', id);
    this.list = this.list.filter((player) => player.id !== id);
    this.listBack = this.listBack.filter((player) => player.id !== id);
    this.listInfo = this.listInfo.filter((player) => player.id !== id);
  }

  public onEnter(self: ISelf, message: IUpdateMessage): void {
    console.log('Users onEnter: ', message);
    this._item = this._getUserById(message.id as string);
    if (this._item) this._item.name = message.name as string;
    else {
      // Вот такая ситуация возможна только если сервер упал и перезапустился и мы "потеряли юзера"
      console.log('Users onEnter ERROR!!!');
      this._item = this.setNewPlayer(self);
      this._item.name = message.name as string;
    }
  }

  public onReenter(self: ISelf, message: IUpdateMessage): void {
    console.log('Users onReenter: ', message);
    this._item = this._getUserById(message.id as string);
    this._item = {
      ...this._item,
      ...this._START,
    };
    this.list = this.list.filter((user) => user.id !== (message.id as string));
    this.list.push(this._item);

    this._itemInfo = this._getUserInfoById(message.id as string);
    this._itemInfo = {
      id: this._itemInfo.id,
      mesh: this._itemInfo.mesh,
      animation: this._START.animation,
    };
    this._mesh = self.scene[this._item.id];
    if (this._mesh)
      this._mesh.position.set(
        this._START.positionX,
        this._START.positionY - 0.6,
        this._START.positionZ,
      );
    this.listInfo = this.listInfo.filter(
      (user) => user.id !== (message.id as string),
    );
    this.listInfo.push(this._itemInfo);
  }

  public onExplosion(message: IExplosion): IUpdateMessage[] {
    // console.log('Users onExplosion!!!!!!!!!!!!!: ', message);
    this._updates = [];
    this.list.filter((player) => new THREE.Vector3(
      message.positionX,
      message.positionY,
      message.positionZ,
    ).distanceTo(new THREE.Vector3(
      player.positionX,
      player.positionY,
      player.positionZ,
    )) < Number(process.env.EXPLOSION_DISTANCE)).forEach((player: User) => {
      this._v1 = new THREE.Vector3(
        message.positionX,
        message.positionY,
        message.positionZ,
      );
      this._v2 = new THREE.Vector3(
        player.positionX,
        player.positionY,
        player.positionZ,
      );
      if (this._v1.distanceTo(this._v2) < Number(process.env.EXPLOSION_DISTANCE)) {
        this._self = 1;
        if (message.enemy === player.id) this._self = Number(process.env.SELF_DAMAGE);
        // Если это выстрел игрока - ущерб сильнее
        // При попадании по коробке - ущерб сильнее
        // Если режим скрытый - в два раза меньше
        player.health +=
          this._self *
          (-1 / this._v1.distanceTo(this._v2)) *
          (player.id === message.enemy ?
            Number(process.env.DAMAGE) * Number(process.env.EXACT_DAMAGE_COEF) :
            Number(process.env.DAMAGE)) *
          (player.animation.includes('hide') ? 0.5 : 1);
        this._updates.push({
          id: player.id,
          health: player.health,
          is: player.id === message.enemy,
        });
      }
      if (player.health < 0) player.animation = 'dead';
    });
    return this._updates;
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

  public onRelocation(self: ISelf, message: IUpdateMessage): void {
    this._item = this._getUserById(message.id as string);

    if (message.direction === 'right' || message.direction === 'left')
      this._item.positionX *= -1;
    else if (message.direction === 'top' || message.direction === 'bottom')
      this._item.positionZ *= -1;

    this._v1 = new THREE.Vector3(
      this._item.positionX,
      0,
      this._item.positionZ,
    ).multiplyScalar(0.85);

    this._item.positionX = this._v1.x;
    this._item.positionY = 0;
    this._item.positionZ = this._v1.z;

    this._mesh = self.scene[this._item.id];
    if (this._mesh) {
      if (this._item.animation.includes('hide'))
        this._mesh.position.set(
          this._v1.x,
          -0.4,
          this._v1.z,
        );
      else
        this._mesh.position.set(
          this._v1.x,
          -0.6,
          this._v1.z,
        );
    }
  }

  // Пришли обновления от клиента
  public onUpdateToServer(self: ISelf, message: IUpdateMessage): void {
    // console.log('Users onUpdateToServer: ', message);
    this._item = this._getUserById(message.id as string);
    if (this._item) {
      for (let property in message) {
        if (property != 'id') {
          if (property === 'time') {
            this._itemBack = this._getUserBackById(message.id as string);
            this._itemBack.time = message[property] as number;
            this._itemBack.play =
              (this._itemBack.time - this._itemBack.unix) / 60;
          } else {
            if (
              property === 'animation' &&
              message[property] &&
              this._item.animation !== message[property]
            ) {
              /* console.log(
                'Users onUpdateToServer АНИМАЦИЯ!!!!',
                message[property],
              ); */

              // Если сменился режим скрытности - изменяем размер коробки
              if (
                ((message[property] as string).includes('hide') &&
                  !this._item.animation.includes('hide')) ||
                (!(message[property] as string).includes('hide') &&
                  this._item.animation.includes('hide'))
              ) {
                this._itemInfo = this._getUserInfoById(message.id as string);
                this._mesh = self.scene[this._itemInfo.id];
                if (this._mesh) {
                  if ((message[property] as string).includes('hide'))
                    this._mesh.scale.set(1, 0.6, 1);
                  else this._mesh.scale.set(1, 1, 1);
                }
              }
            }

            this._item[property] = message[property];
          }
        }
      }
    }
  }

  public animate(self: ISelf): void {
    this.list.forEach((user) => {
      this._mesh = self.scene[user.id];
      if (this._mesh) {
        if (user.health > 0) {
          if (user.health < 100) user.health += self.events.delta * Number(process.env.REGENERATION);
          if (user.health > 100) user.health = 100;
        }

        if (user.animation.includes('hide'))
          this._mesh.position.set(
            user.positionX,
            user.positionY - 0.4,
            user.positionZ,
          );
        else
          this._mesh.position.set(
            user.positionX,
            user.positionY - 0.6,
            user.positionZ,
          );
      }
    });
  }

  public cleanCheck(): void {
    console.log('Users cleanCheck!!!');
    const time = Helper.getUnixtime();
    this.listBack.forEach((player: IUserBack) => {
      if (time - player.time > Number(process.env.CLEAN_CHECK_TIME)) this._removePlayer(player.id);
    });
  }
}
