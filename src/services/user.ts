// Nest
import { Injectable } from '@nestjs/common';

@Injectable()
export default class User {
  constructor(
    readonly id: number,
  ) {
    console.log('UUUUUUUSSSSSEEEERRR!', this.id);
  }
}
