// Library
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

// Types
import { IUpdateMessage, IShot, IExplosion } from '../models/models';

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
      !this._game.checkPlayerId(message.id as string)
    ) {
      console.log('Не пришел айди игрока!');
      client.emit(Messages.setNewPlayer, this._game.setNewPlayer());
    } else {
      client.emit(Messages.onUpdatePlayer, this._game.updatePlayer(message.id as string));
    }
  }

  // Пользователь сказал как его зовут
  @SubscribeMessage(Messages.enter)
  async onEnter(client, message: IUpdateMessage): Promise<void> {
    console.log('Gateaway onEnter()!', message);
    this._game.onEnter(message);
    client.emit(Messages.onEnter);
  }

  // Пользователь сказал как его зовут
  @SubscribeMessage(Messages.reenter)
  async onReenter(client, message: IUpdateMessage): Promise<void> {
    console.log('Gateaway onRenter()!', message);
    this._game.onReenter(message);
  }

  // Пришли обновления от клиента
  @SubscribeMessage(Messages.updateToServer)
  async onUpdateToServer(client, message: IUpdateMessage): Promise<void> {
    this._game.onUpdateToServer(message);
  }

  // Пришли обновления от клиента
  @SubscribeMessage(Messages.shot)
  async onShot(client, message: IShot): Promise<void> {
    this.server.emit(Messages.onShot, this._game.onShot(message));
  }

  // Выстрел клиента улетел
  @SubscribeMessage(Messages.unshot)
  async onUnshot(client, message: number): Promise<void> {
    this._game.onUnshot(message);
    this.server.emit(Messages.onUnshot, message);
  }

  // Взрыв на клиенте
  @SubscribeMessage(Messages.explosion)
  async explosion(client, message: IExplosion): Promise<void> {
    // console.log('Gateaway explosion!!!', message);
    this._game.onUnshot(message.id); // Удаляем выстрел
    this.server.emit(Messages.onExplosion, this._game.onExplosion(message));
  }

  // Взрыв на клиенте
  @SubscribeMessage(Messages.selfharm)
  async selfharm(client, message: IUpdateMessage): Promise<void> {
    // console.log('Gateaway selfharm!!!', message);
    this.server.emit(Messages.onSelfharm, this._game.onSelfharm(message));
  }
}
