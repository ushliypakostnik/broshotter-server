// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { IUnit } from '../../../models/api';

@Injectable()
export default class User implements IUnit {
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
