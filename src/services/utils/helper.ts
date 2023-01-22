import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

// Types
import { IPosition } from '../../models/api';

@Injectable()
export default class Helper {
  // Math

  static randomInteger(min: number, max: number): number {
    const rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  }

  static yesOrNo(): boolean {
    return Math.random() >= 0.5;
  }

  public plusOrMinus(): number {
    return Math.random() >= 0.5 ? 1 : -1;
  }

  public distance2D(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static damping(delta: number): number {
    return Math.exp(-3 * delta) - 1;
  }

  public getRandomPosition(
    centerX: number,
    centerZ: number,
    radius: number,
    isSafeCenter: boolean,
  ): IPosition {
    const safe = isSafeCenter ? 16 : 8;
    const a = this.plusOrMinus();
    const b = this.plusOrMinus();
    return {
      x: Math.round(centerX + Math.random() * a * radius) + safe * a,
      z: Math.round(centerZ + Math.random() * b * radius) + safe * b,
    };
  }

  private _isBadPosition(
    positions: IPosition[],
    position: IPosition,
    distance: number,
  ): boolean {
    return !!positions.find(
      (place: IPosition) =>
        this.distance2D(place.x, place.z, position.x, position.z) < distance,
    );
  }

  public getUniqueRandomPosition(
    positions: IPosition[],
    centerX: number,
    centerZ: number,
    distance: number,
    radius: number,
    isSafeCenter: boolean,
  ): IPosition {
    let position: IPosition = this.getRandomPosition(
      centerX,
      centerZ,
      radius,
      isSafeCenter,
    );
    while (this._isBadPosition(positions, position, distance)) {
      position = this.getRandomPosition(centerX, centerZ, radius, isSafeCenter);
    }
    return position;
  }

  // Utils

  static isEmptyObject(target: object): boolean {
    return Object.keys(target).length === 0 && target.constructor === Object;
  }

  static isHasProperty(target: object, property: string): boolean {
    return Object.prototype.hasOwnProperty.call(target, property);
  }

  static generateUniqueId(length: number, ids: string[]): string {
    let id;
    while (!id || ids.includes(id)) {
      id = randomBytes(length).toString('hex');
    }
    return id;
  }

  static getUnixtime(date?: Date): number {
    if (date) return Math.round(date.getTime()/1000.0);
    return Math.round(new Date().getTime()/1000.0);
  }
}
