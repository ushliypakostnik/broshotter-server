// Nest
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

// Controllers
import { Index } from './controllers';

// Services
import { Users } from './services/users';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [Index],
  providers: [Users],
})
export class App {}
