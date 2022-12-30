// Тест REST API
export interface IIndex {
  [key: string]: any,
}

// Websockets messages
export enum Messages {
  onConnect = 'onConnect', // На присоединение пользователя
  onOnConnect = 'onOnConnect', // Ответ клиента серверу на соединение
  setNewPlayer = 'setNewPlayer', // // Установить нового игрока
  updateToClients = 'updateToClients', // Постоянные обновления клиентам
  updateToServer = 'updateToServer', // Пришло обновление от клиента
}

// Игрок

// Айди
interface IUserId {
  id: string;
}

export interface IUser extends IUserId {
  id: string;
  name: string;
}

// Для бека
export interface IUserBack extends IUserId {
  id: string;
  last: string;
}

// Обновление
type TUpdate = {
  [key: string]: number | string | boolean | null;
}

// Обновления игрока
export interface IUpdateMessage {
  id: string,
  updates: TUpdate,
}

// Игра
export interface IGameState {
  users: {
    [key: string]: IUser,
  },
}

// Обновления игры
export interface IGameUpdates {
  users: IUpdateMessage[],
}
