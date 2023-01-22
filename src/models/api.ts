// Websockets messages
export enum Messages {
  // Players

  onConnect = 'onConnect', // На присоединение пользователя
  onOnConnect = 'onOnConnect', // Ответ клиента серверу на соединение
  setNewPlayer = 'setNewPlayer', // Установить нового игрока
  onUpdatePlayer = 'onUpdatePlayer', // Подтвердить нового игрока
  enter = 'enter', // Назваться и зайти в игру
  onEnter = 'onEnter', // Отклик сервера о заходе
  reenter = 'reenter', // Начать сначала

  updateToClients = 'updateToClients', // Постоянные обновления клиентам
  updateToServer = 'updateToServer', // Пришло обновление от клиента

  shot = 'shot', // Выстрел
  onShot = 'onShot', // На выстрел
  unshot = 'unshot', // Удаление выстрела
  onUnshot = 'onUnshot', // На удаление выстрела
  explosion = 'explosion', // На взрыв
  onExplosion = 'onExplosion', // На ответ взрыв
  selfharm = 'selfharm', // Самоповреждение
  onSelfharm = 'onSelfharm', // На самоповреждение
  relocation = 'relocation', // Переход на другую локацию
  onRelocation = 'onRelocation', // На переход на другую локацию
}

// Движущийся объект принадлежащий игроку (выстрел) или сам игрок
export interface IMoveObject {
  positionX: number;
  positionY: number;
  positionZ: number;
  directionX: number;
  directionY: number;
  directionZ: number;
}

// Выстрел
export interface IShot extends IMoveObject {
  id: number | null;
  player: string;
  location: string;
  startX: number;
  startY: number;
  startZ: number;
  gravity: number;
}

export interface IExplosion extends IShot {
  enemy: string;
}

export interface IOnExplosion {
  message: IExplosion;
  updates: IUpdateMessage[],
}

// Игрок
export interface IUnit extends IMoveObject {
  id: string
  name: string;
  animation: string;
  isFire: boolean;
  isOnHit: boolean;
}

// Для бека
export interface IUserBack {
  id: string;
  last: Date;
  unix: number;
  time: number | null;
  play: number;
  counter: number;
}

// Обновления игрока
export interface IUpdateMessage {
  [key: string]: number | string | boolean | null;
}

// Обновления игры

export interface IWeaponModule {
  [key: string]: IShot[];
}

export interface IModule {
  [key: string]: IUnit[];
}

export interface IGameUpdates {
  users: IUnit[];
  weapon: IWeaponModule;
  npc: IModule,
}

// Мир
export interface IPosition {
  x: number;
  z: number;
}

export interface ITree {
  x: number;
  z: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export interface ILocation {
  id: string;
  x: number;
  y: number;
}

export interface ILocationUsers extends ILocation {
  users: string[];
  npc: string[];
}

export interface ILocationWorld extends ILocation {
  name: string;
  ground: string;
  trees: ITree[];
}

export interface ILocations {
  [key: string]: ILocationUsers;
}

export interface ILocationsWorld {
  [key: string]: ILocationWorld;
}

export interface IUserUpdate {
  player: IUpdateMessage;
  npc: IUnit[],
}
