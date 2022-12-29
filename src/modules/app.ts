// Nest
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

// Controllers
import { Index } from '../controllers';

// Services
import Gateway from '../services/gateaway';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [Index],
  providers: [Gateway],
})
export class App {
  constructor() {
    console.log('App constructor()', this);
  }
}
