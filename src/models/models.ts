// Тест REST API
export interface IIndex {
  [key: string]: any,
}

// Websockets messages
export enum Messages {
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
export interface IUser extends IMoveObject {
  id: string;
  name: string;
  animation: string;
  isFire: boolean;
  isOnHit: boolean;
}

// Для бека
export interface IUserBack {
  id: string;
  last: string;
}

// Обновления игрока
export interface IUpdateMessage {
  [key: string]: number | string | boolean | null;
}

// Обновления игры
export interface IGameUpdates {
  users: IUser[],
  shots: IShot[],
}
