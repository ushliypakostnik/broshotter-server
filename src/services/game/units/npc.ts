import * as THREE from 'three';

// Modules
import Zombies from './npc/zombies';

// Types
import { ISelf } from '../../../models/modules';
import {
  IModule,
  IUnit,
  IUpdateNPCMessage,
  IExplosion,
  IUpdateMessage,
} from '../../../models/api';

export default class NPC {
  // Modules
  public zombies: Zombies;

  private _time = 0;
  private _item!: IUnit;
  private _v1!: THREE.Vector3;

  constructor() {
    // Modules
    this.zombies = new Zombies();
  }

  private _getCount(): number {
    return this.zombies.counter;
  }

  private _getNPCById(id: string): IUnit {
    return this.getList().find((npc) => npc.id === id);
  }

  public getList(): IUnit[] {
    return this.zombies.list; // TODO - исправить если будет больше NPC
  }

  // Взять неписей на локации
  public getNPCOnLocation(ids: string[]): IModule {
    return {
      zombies: this.zombies.list.filter((npc) => ids.includes(npc.id)),
    };
  }

  public onExplosion(message: IExplosion): IUpdateNPCMessage {
    // console.log('NPC onExplosion!!!!!!!!!!!!!: ', message);
    return {
      zombies: this.zombies.onExplosion(message),
    };
  }

  // Засыпают или просыпаются
  public toggleSleep(ids: string[], is: boolean): void {
    // console.log('NPC toggleSleep!!!!!!!!!!!!!: ', message);
    this.zombies.toggleSleep(ids, is);
  }

  // На релокацию неписей
  public onNPCRelocation(self: ISelf, message: IUpdateMessage): void {
    this._item = this._getNPCById(message.id as string);
    // console.log('NPC onNPCRelocation!!!!!!!!!!!!!: ', this._item);
    if (message.direction === 'right' || message.direction === 'left')
      this._item.positionX *= -1;
    else if (message.direction === 'top' || message.direction === 'bottom')
      this._item.positionZ *= -1;

    this._v1 = new THREE.Vector3(
      this._item.positionX,
      0,
      this._item.positionZ,
    ).multiplyScalar(0.85);

    this._item.positionX = this._v1.x;
    this._item.positionY = 0;
    this._item.positionZ = this._v1.z;

    this.zombies.setUnit(self, this._item);
  }

  public animate(self: ISelf): void {
    // console.log('Zombies animate', units);
    // Решение на создание нового зомби
    this._time += self.events.delta;
    if (this._time > 0.1) {
      if (this._getCount() < Number(process.env.MAX_NPC))
      this.zombies.addUnit(self);
      this._time = 0;
    }

    this.zombies.animate(self);
  }
}
