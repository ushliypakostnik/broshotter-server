// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { IUser } from '../../../models/models';

@Injectable()
export default class User implements IUser {
  public name!: string;

  constructor(
    readonly id: string
  ) {
  }
}
