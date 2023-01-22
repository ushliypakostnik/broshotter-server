import type { Scene } from 'three';
import type Events from '../services/utils/events';
import type Octree from '../services/math/octree';
import type EventEmitter from 'events';

// Набор локаций
export interface Octrees {
  [key: string]: Octree;
}

// Main object
export interface ISelf {
  // Utils
  emiiter: EventEmitter, // шина сообщений между модулями
  events: Events; // шина игровых событий

  // Math
  octrees: Octrees; // модели локаций
  octrees2: Octrees; // отсечения локации из игроков и неписей

  // Core
  scene: Scene;
}

// Emitter events
export enum EmitterEvents {
  addNPC = 'addNPC',
}
