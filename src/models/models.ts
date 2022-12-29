export interface IIndex {
  [key: string]: any,
}

export enum Messages {
  onConnect = 'onConnect', // На присоединение пользователя
  onOnConnect = 'onOnConnect', // Ответ клиента серверу на соединение
  updateToClients = 'updateToClients', // Постоянные обновления клиентам
  updateToServer = 'updateToServer', // Пришло обновление от клиента
  onUpdateToServer = 'onUpdateToServer', // На обновление от клиента
}

export type TUpdateMessage = {
  name: string,
}

export interface IUser extends TUpdateMessage {
  id: string;
}

export interface IGameState {
  game: {
    users: IUser[],
  },
}
