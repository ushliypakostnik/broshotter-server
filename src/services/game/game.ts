import * as THREE from 'three';

// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { ISelf } from '../../models/modules';
import type {
  IUpdateMessage,
  IShot,
  IOnExplosion,
  IExplosion,
  IUnit,
  IGameUpdates,
  ILocationUnits,
  IUnitsByLocations,
  IMapUnit,
  IModule,
} from '../../models/api';

// Constants
import { EmitterEvents } from '../../models/modules';

// Modules
import Events from '../utils/events';
import World from './world/world';
import Users from './units/users';
import Weapon from './weapon/weapon';
import NPC from './units/npc';

@Injectable()
export default class Game {
  public world: World;
  public users: Users;
  public weapon: Weapon;
  public npc: NPC;

  private _events: Events;
  private _self: ISelf;

  private _user!: IUnit;
  private _units!: IUnitsByLocations;
  private _npcs: IModule;

  private _id!: string;
  private _ids!: string[];
  private _p1!: THREE.Vector3;
  private _p2!: THREE.Vector3;
  private _number!: number;

  private _timeLazyChecks = 0;
  private _isRight = false;
  private _isBottom = false;
  private _result!: string;

  constructor() {
    const EventEmitter = require('events');
    this._events = new Events();
    this._self = {
      emiiter: new EventEmitter(),
      events: this._events,
      octrees: {},
      scene: {},
      unitsByLocations: {},
      units: {},
    };

    this.world = new World();
    this.users = new Users();
    this.weapon = new Weapon();
    this.npc = new NPC();

    this.world.init(this._self);

    this._self.unitsByLocations = this._getUnitsByLocations();
    // addNPC event subscribe
    this._self.emiiter.on(EmitterEvents.addNPC, (npc) => {
      this._self.unitsByLocations = this._getUnitsByLocations();
    });

    this._animate();
  }

  // Актуальные обновления игрового мира
  public getGameUpdates(location: string): IGameUpdates {
    this._npcs = this.npc.getNPCOnLocation(this.world.locations[location].npc);

    return {
      users: this.users.list.filter((user) =>
        this.world.locations[location].users.includes(user.id),
      ),
      // TODO - улучшить если станет больше NPC
      npc: {
        zombies: this._npcs.zombies,
      },
      weapon: {
        shots: this.weapon.shots.list.filter(
          (shot) => shot.location === location,
        ),
      },
    };
  }

  // Взять игровые объекты по локациям
  // TODO - улучшить если станет больше NPC
  private _getUnitsByLocations(): IUnitsByLocations {
    this._units = {};
    this.world.array.forEach((location: ILocationUnits) => {
      this._ids = this.world.locations[location.id].users.concat(
        this.world.locations[location.id].npc,
      );
      this._units[location.id] = this.users.listInfo
        .filter((unit) => this._ids.includes(unit.id))
        .concat(
          this.npc.zombies.listInfo.filter((unit) =>
            this._ids.includes(unit.id),
          ),
        );
    });
    // console.log('Game _getUnitsByLocations: ', this._units);
    return this._units;
  }

  // Взять игровые объекты на локации
  public getUnitsByLocationsId(id: string): IMapUnit[] {
    if (this.world.locations[id]) {
      this._ids = this.world.locations[id].users.concat(
        this.world.locations[id].npc,
      );
      // console.log('Game _getUnitsByLocations: ', this._units);
      return this.npc.getList().filter((npc) => this._ids.includes(npc.id))
        .concat(this.users.getList().filter((user) => this._ids.includes(user.id)))
        .map((unit) => {
          return {
            id: unit.id,
            type: unit.id.includes('NPC') ? 'NPC' : 'player',
            x: unit.positionX / Number(process.env.SIZE),
            y: unit.positionZ / Number(process.env.SIZE),
            isDead: unit.isDead,
          }
        });
    }
  }

  // Новый игрок
  public setNewPlayer(): IUpdateMessage {
    this._user = this.users.setNewPlayer(this._self);
    this._id = this.world.setNewPlayer(this._self, this._user.id as string);
    this._self.unitsByLocations = this._getUnitsByLocations();
    return {
      location: this._id,
      ...this._user,
    };
  }

  // Знакомый игрок
  public updatePlayer(id: string): IUpdateMessage {
    this._user = this.users.updatePlayer(id);
    this._id = this.world.updatePlayer(id);
    return {
      location: this._id,
      ...this._user,
    };
  }

  // Проверка идентификатора игрока
  public checkPlayerId(id: string): boolean {
    return this.users.checkPlayerId(id);
  }

  // Очистка игроков
  public cleanCheck(): void {
    this.users.cleanCheck();
  }

  // Заход игрока
  public onEnter(message: IUpdateMessage): void {
    this.users.onEnter(this._self, message);
    this._checkUnits();
  }

  // Перезаход игрока
  public onReenter(message: IUpdateMessage): void {
    this.users.onReenter(this._self, message);
    this.world.onReenter(this._self, message);
    this._self.unitsByLocations = this._getUnitsByLocations();
    this._checkUnits();
  }

  // Релокация игрока
  public onRelocation(message: IUpdateMessage): void {
    this.users.onRelocation(this._self, message);
    this.world.onRelocation(this._self, message);
    this._self.unitsByLocations = this._getUnitsByLocations();
    this._checkUnits();
  }

  // Релокация неписи
  private _onNPCRelocation(message: IUpdateMessage): void {
    this.npc.onNPCRelocation(this._self, message);
    this.world.onNPCRelocation(this._self, message);
    this._self.unitsByLocations = this._getUnitsByLocations();
  }

  // На обновления от клиентов
  public onUpdateToServer(message: IUpdateMessage): void {
    this.users.onUpdateToServer(this._self, message);
  }

  // На выстрел
  public onShot(message: IShot): IShot {
    return this.weapon.onShot(message);
  }

  // Выстрел умер
  public onUnshot(message: number): string {
    return this.weapon.onUnshot(message);
  }

  // На взрыв от умирания выстрела
  public onUnshotExplosion(message: number): void {
    return this.weapon.onUnshotExplosion(message);
  }

  // На взрыв
  public onExplosion(message: IExplosion): IOnExplosion {
    return {
      message,
      updates: {
        users: this.users.onExplosion(message),
        npc: this.npc.onExplosion(message),
      },
    };
  }

  // На самоповреждение
  public onSelfharm(message: IUpdateMessage): IUpdateMessage {
    return this.users.onSelfharm(message);
  }

  // Ленивая проверка неписей
  private _lazyChecks(): void {
    // console.log('Game _lazyChecks!!!');
    this._number = 0;
    this.npc.getList().forEach((npc) => {
      this._id = this.world.getLocationIdByNPCId(npc.id);
      this._p1 = new THREE.Vector3(
        npc.positionX,
        npc.positionY,
        npc.positionZ,
      );
      this._p2 = new THREE.Vector3(0, 0, 0);

      // console.log(npc.positionX, npc.positionZ, this._p1.distanceTo(this._p2));

      // Выход на другую локацию
      if (this._p1.distanceTo(this._p2) > Number(process.env.SIZE) * 0.7) {
        ++this._number;
        this._isRight = npc.positionX >= 0;
        this._isBottom = npc.positionZ >= 0;
        if (
          Math.abs(npc.positionX) >= Math.abs(npc.positionZ)
        ) {
          if (this._isRight) this._result = 'right';
          else this._result = 'left';
        } else {
          if (this._isBottom) this._result = 'bottom';
          else this._result = 'top';
        }
        this._onNPCRelocation({ id: npc.id, direction: this._result, location: this._id });
      }
    });
    if (this._number > 0) this._checkUnits();
  }

  // Главная оптимизирующая механика
  private _checkUnits() {
    this.world.array.forEach((location: ILocationUnits) => {
      this._ids = this.world.locations[location.id].npc;

      if (this.world.locations[location.id].users.length > 0) {
        // console.log('Game _checkUnits: ', location.id, this.world.locations[location.id].users);
        this.npc.toggleSleep(this._ids, false);
      } else this.npc.toggleSleep(this._ids, true);
    });
  }

  private _animate(): void {
    this._events.animate();

    // console.log('Game animate delta: ', this._self.events.delta, this.npc.zombies.list.length);

    this.npc.animate(this._self);
    this.users.animate(this._self);

    // Ленивые проверки - которые можно делать редко
    this._timeLazyChecks += this._self.events.delta;
    if (this._timeLazyChecks > 10) {
      this._lazyChecks();
      this._timeLazyChecks = 0;
    }

    setTimeout(() => {
      this._animate();
    }, 0);
  }
}
