// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { IUser } from '../../../models/models';

@Injectable()
export default class User implements IUser {
  public name!: string;
  public health: number;
  public positionX: number;
  public positionY: number;
  public positionZ: number;
  public directionX: number;
  public directionY: number;
  public directionZ: number;

  public animation: string;
  public isFire: boolean;
  public isOnHit: boolean;

  constructor(
    readonly id: string
  ) {
    this.health = 100;
  }
}
