// Nest
import { Controller, Get, Param, HttpCode, Inject } from '@nestjs/common';

// Types
import type {
  ILocation,
  ILocationUsers,
} from '../models/models';

// Modules
import Gateway from '../services/gateway';
import User from '../services/game/users/user';

@Controller()
export class Index {
  @Inject(Gateway)
  private _gateway: Gateway;

  @Get('/map')
  @HttpCode(200)
  public getMap(): { locations: ILocationUsers[]; users: User[] } {
    console.log('Controller Get getMap!!!');
    return {
      locations: this._gateway.game.world.array,
      users: this._gateway.game.users.list,
    };
  }

  @Get(':id')
  @HttpCode(200)
  public getLocation(@Param() params): ILocation {
    console.log('Controller Get getLocation!!! ', params);
    return this._gateway.game.world.design[params.id];
  }
}
