// Nest
import { Controller, Get, Body } from '@nestjs/common';

// Services
import { Users } from '../services/users';

@Controller()
export class Index {
  constructor(private readonly users: Users) {}

  @Get()
  addUser(@Body() body: number | null): number {
    return this.users.addUser();
  }
}
