import type { Mesh, Vector3 } from 'three';
import type Events from '../services/utils/events';
import type Octree from '../services/math/octree';
import type Capsule from '../services/math/capsule';
import type EventEmitter from 'events';
import { IUnitsByLocations } from './api';

// Набор локаций
export interface Octrees {
  [key: string]: Octree;
}

// Main object
export interface ISelf {
  // Utils
  emiiter: EventEmitter, // шина сообщений между модулями
  events: Events; // шина игровых событий

  // Objects
  scene: { [key: string]: Mesh }; // хранилище коробок
  unitsByLocations: IUnitsByLocations; // данные о пользователях по локациям
  units: { [key: string]: string }; // сопоставление - пользователь/локация

  // Math
  octrees: Octrees; // модели локаций
}

// Emitter events
export enum EmitterEvents {
  addNPC = 'addNPC',
}

export interface IUnitCollider {
  collider: Capsule;
  velocity: Vector3;
  isNotJump: boolean;
  isForward: boolean;
  isRun: boolean;
  isJump: boolean;
  isJump2: boolean;
  timerJump: number;
  bend: number;
  octree: Octree;
}

export interface IUnitColliders {
  [key: string]: IUnitCollider;
}

type TResultTrue = {
  normal: Vector3;
  point?: Vector3;
  depth: number;
};
export type TResult = TResultTrue | false;
