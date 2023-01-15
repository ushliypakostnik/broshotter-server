// Nest
import { Injectable } from '@nestjs/common';

// Math
import math3d from 'math3d';

// Types
import { IShot } from '../../../models/models';

// Utils
import Helper from '../../utils/helper';

@Injectable()
export default class Shots {
  public list: IShot[];
  private _item!: IShot;
  private _counter = 0;
  private _timeout!: ReturnType<typeof setTimeout>;
  private _math: math3d;
  private _v1!: math3d.Vector3;
  private _v2!: math3d.Vector3;
  private _v3!: math3d.Vector3;
  private _v4!: math3d.Vector3;
  private _center!: math3d.Vector3;
  private _distance!: number;
  private _damping!: number;

  constructor() {
    this.list = [];

    // Запускаем постоянные обновления положения выстрелов
    this._timeout = setInterval(
      () => this._upgrade(),
      process.env.TIMEOUT as unknown as number,
    );

    this._math = require('math3d');
    this._center = new this._math.Vector3(0, 0, 0);
  }

  public onShot(message: IShot): IShot {
    ++this._counter;
    this._item = {
      ...message,
      id: this._counter,
      gravity: 0,
    };
    this.list.push(this._item);
    // console.log('Shots onShot()!', message);
    return this._item;
  }

  public onUnshot(message: number): string {
    this._item = this.list.find((shot) => shot.id === message);
    this.list = this.list.filter((shot) => shot.id !== message);
    // console.log('Shots onUnshot()!', message, this.list.length);
    return this._item.location;
  }

  public onUnshotExplosion(message: number): void {
    this.list = this.list.filter((shot) => shot.id !== message);
    // console.log('Shots onUnshotExplosion()!', message, this.list.length);
  }

  private _upgrade() {
    this.list.forEach((shot) => {
      this._v1 = new this._math.Vector3(
        shot.positionX,
        shot.positionY,
        shot.positionZ,
      );
      this._v2 = new this._math.Vector3(
        shot.directionX,
        shot.directionY,
        shot.directionZ,
      );
      this._v3 = new this._math.Vector3(shot.startX, shot.startY, shot.startZ);
      // Гравитация и небольшое снижение скорости
      this._distance = this._v1.distanceTo(this._v3);
      if (this._distance > 10) shot.gravity -= 0.0025;

      this._v2 = this._v2.mulScalar(0.95);

      this._v4 = this._v1.add(this._v2);
      shot.positionX = this._v4.x;
      shot.positionY = this._v4.y + shot.gravity;
      shot.positionZ = this._v4.z;

      // Сносим выстрел если он улетел за пределы локации
      // Если ушел под пол или улетел слишком высоко
      if (
        ((this._v1.distanceTo(this._center) >
          process.env.SIZE) as unknown as number) * 2.5 ||
        this._v3.positionY < -50
      )
        this.onUnshot(shot.id as number);
    });
  }
}
