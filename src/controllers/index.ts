// Nest
import { Controller, Post, Body, HttpCode } from '@nestjs/common';

// Types
import { IIndex } from '../models/models';

@Controller()
export class Index {
  @Post()
  @HttpCode(200)
  index(@Body() body: IIndex) {
    console.log('Post: ', body);
  }
}
