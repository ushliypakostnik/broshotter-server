import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export default class Helper {
  static isEmptyObject(target: object): boolean {
    return Object.keys(target).length === 0 && target.constructor === Object;
  }

  static isHasProperty(target: object, property: string): boolean {
    return Object.prototype.hasOwnProperty.call(target, property);
  }

  static generatePlayerId(): string {
    return randomBytes(8).toString('hex');
  }
}
