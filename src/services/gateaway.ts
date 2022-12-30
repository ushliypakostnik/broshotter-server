// Library
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

// Types
import { IUpdateMessage } from '../models/models';

// Constants
import { Messages } from '../models/models';

// Services
import { Game } from '../services/game/game';

// Utils
import Helper from './utils/helper';

@WebSocketGateway({
  cors: {
    credentials: true,
  },
  allowEIO3: true,
})
export default class Gateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server;

  // Gameplay
  private _game: Game;
  private _timeout!: ReturnType<typeof setTimeout>;

  constructor() {
    // Go!
    this._game = new Game();

    // Запускаем постоянные обновления клиентов
    this._timeout = setInterval(
      () => this.getGameUpdates(),
      process.env.TIMEOUT as unknown as number,
    );
  }

  // Пульнуть всем стейт игры
  getGameUpdates(): void {
    if (this.server) {
      // console.log('Gateaway getGame() timeout!');
      this.server.emit(Messages.updateToClients, this._game.getGameUpdates());
    }
  }

  // Присоединился пользователь
  async handleConnection(T): Promise<typeof T> {
    console.log('Gateaway handleConnection() connect!');
    this.server.emit(Messages.onConnect, this._game.getGameUpdates());
  }

  // Пользователь отвалился
  async handleDisconnect(T): Promise<typeof T> {
    console.log('Gateaway handleDisconnect()!');
  }

  // Пришла реакция на сообщение о соединении
  @SubscribeMessage(Messages.onOnConnect)
  async onOnConnect(client, message: IUpdateMessage): Promise<void> {
    console.log('Gateaway onOnConnect()!', message);
    // Если пришел айди или пришел но неправильный - добавляем игрока
    if (
      Helper.isEmptyObject(message) ||
      !Helper.isHasProperty(message, 'id') ||
      !message.id ||
      !this._game.checkPlayerId(message.id)
    ) {
      console.log('Не пришел айди игрока!');
      client.emit(Messages.setNewPlayer, this._game.setNewPlayer());
    } else this._game.updatePlayer(message.id);
  }

  // Пришли обновления от клиента
  @SubscribeMessage(Messages.updateToServer)
  async onUpdateToServer(client, message: IUpdateMessage): Promise<void> {
    // console.log('Gateaway onUpdateToServer()!', message);
    this._game.onUpdateToServer(message);
  }
}
