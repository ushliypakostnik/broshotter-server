// Nest
import { Controller, Get, Param, HttpCode, Inject } from '@nestjs/common';

// Types
import type { ILocation, IMapUnit, IUserBack } from '../models/api';

// Modules
import Gateway from '../services/gateway';

@Controller()
export default class Api {
  @Inject(Gateway)
  private _gateway: Gateway;

  @Get('/map/:id')
  @HttpCode(200)
  public getMap(@Param() params): { locations: ILocation[], units: IMapUnit[] } {
    return {
      locations: this._gateway.game.world.array.map((location) => {
       return {
          id: location.id,
          x: location.x,
          y: location.y,
        };
      }),
      units: this._gateway.game.getUnitsByLocationsId(params.id),
    }
  }

  @Get('/stats')
  @HttpCode(200)
  public getStats(): { users: number; shots: number; now: number; list: IUserBack[] } {
    // console.log('Controller Get getStats!!!');
    return {
      users: this._gateway.game.users.counter,
      shots: this._gateway.game.weapon.shots.counter,
      now: this._gateway.game.weapon.shots.list.length,
      list: this._gateway.game.users.listBack,
    };
  }

  @Get('/locations/:id')
  @HttpCode(200)
  public getLocation(@Param() params): ILocation {
    // console.log('Controller Get getLocation!!! ', params);
    return this._gateway.game.world.design[params.id];
  }
}
