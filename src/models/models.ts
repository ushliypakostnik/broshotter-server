// Тест REST API
export interface IIndex {
  [key: string]: any,
}

// Websockets messages
export enum Messages {
  onConnect = 'onConnect', // На присоединение пользователя
  onOnConnect = 'onOnConnect', // Ответ клиента серверу на соединение
  updateToClients = 'updateToClients', // Постоянные обновления клиентам
  updateToServer = 'updateToServer', // Пришло обновление от клиента
  onUpdateToServer = 'onUpdateToServer', // На обновление от клиента
}

// Игрок
export interface IUser {
  id: string;
  name: string,
}

// Обновления игрока
export interface TUpdateMessage {
  user: IUser,
}

// Игра
export interface IGameState {
  game: {
    users: IUser[],
  },
}
