// Nest
import { Injectable } from '@nestjs/common';

@Injectable()
export default class User {
  constructor(public readonly id: number) {}
}
