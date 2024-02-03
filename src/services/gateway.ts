// Library
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

// Types
import {
  IUpdateMessage,
  IShot,
  IExplosion,
  ILocationUnits,
} from '../models/api';

// Constants
import { Messages } from '../models/api';

// Services
import Game from '../services/game/game';

// Utils
import Helper from './utils/helper';

@WebSocketGateway({
  cors: {
    credentials: true, // TODO!!! For development!!!
  },
  allowEIO3: true,
})
export default class Gateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server;

  // Gameplay
  public game: Game;

  private _timeout!: ReturnType<typeof setInterval>;
  private _counter = 0;
  private _locations: ILocationUnits[];

  constructor() {
    // Go!
    this.game = new Game();

    // Запускаем постоянные обновления клиентов
    this._timeout = setInterval(
      () => this.getGameUpdates(),
      process.env.TIMEOUT as unknown as number,
    );
  }

  // Пульнуть всем стейт игры по локациям
  getGameUpdates(): void {
    if (this.server) {
      this._locations = this.game.world.array.filter(
        (location) => location.users.length > 0,
      );
      this._locations
        .forEach((location: ILocationUnits) => {
          this.server
            .to(location.id)
            .emit(
              Messages.updateToClients,
              this.game.getGameUpdates(location.id),
            );
        });

      // Удаление пользователей
      ++this._counter;
      if (this._counter > 4000) {
        this.game.cleanCheck();
        this._counter = 0;
      }
    }
  }

  // Присоединился пользователь
  async handleConnection(T): Promise<typeof T> {
    console.log('Gateway handleConnection() connect!');
    this.server.emit(Messages.onConnect);
  }

  // Пользователь отвалился
  async handleDisconnect(T): Promise<typeof T> {
    console.log('Gateway handleDisconnect()!');
  }

  // Пришла реакция на сообщение о соединении
  @SubscribeMessage(Messages.onOnConnect)
  async onOnConnect(client, message: IUpdateMessage): Promise<void> {
    console.log('Gateway onOnConnect()!', message);

    // Если пришел айди или пришел но неправильный - добавляем игрока
    let player;
    if (
      Helper.isEmptyObject(message) ||
      !Helper.isHasProperty(message, 'id') ||
      !this.game.checkPlayerId(message.id as string)
    ) {
      player = this.game.setNewPlayer();
      client.join(player.location);
      client.emit(Messages.setNewPlayer, player);
      console.log('Gateway Не пришел айди игрока!', player);
    } else {
      player = this.game.updatePlayer(message.id as string);
      client.join(player.location);
      client.emit(Messages.onUpdatePlayer, player);
      console.log('Gateway Этот игрок уже был!', player);
    }
  }

  // Пользователь сказал как его зовут
  @SubscribeMessage(Messages.enter)
  async onEnter(client, message: IUpdateMessage): Promise<void> {
    console.log('Gateway onEnter()!', message);
    this.game.onEnter(message);
    client.emit(Messages.onEnter);
  }

  // Пользователь сказал как его зовут
  @SubscribeMessage(Messages.reenter)
  async onReenter(client, message: IUpdateMessage): Promise<void> {
    console.log('Gateway onRenter()!', message);
    this.game.onReenter(message);
  }

  // Пришли обновления от клиента
  @SubscribeMessage(Messages.updateToServer)
  async onUpdateToServer(client, message: IUpdateMessage): Promise<void> {
    this.game.onUpdateToServer(message);
  }

  // Пришел выстрел
  @SubscribeMessage(Messages.shot)
  async onShot(client, message: IShot): Promise<void> {
    this.server
      .to(message.location)
      .emit(Messages.onShot, this.game.onShot(message));
  }

  // Выстрел клиента улетел
  @SubscribeMessage(Messages.unshot)
  async onUnshot(client, message: number): Promise<void> {
    this.server
      .to(this.game.onUnshot(message))
      .emit(Messages.onUnshot, message);
  }

  // Взрыв на клиенте
  @SubscribeMessage(Messages.explosion)
  async explosion(client, message: IExplosion): Promise<void> {
    // console.log('Gateway explosion!!!', message);
    this.game.onUnshotExplosion(message.id); // Удаляем выстрел
    this.server
      .to(message.location)
      .emit(Messages.onExplosion, this.game.onExplosion(message));
  }

  // Самоповреждение на клиенте
  @SubscribeMessage(Messages.selfharm)
  async selfharm(client, message: IUpdateMessage): Promise<void> {
    // console.log('Gateway selfharm!!!', message);
    this.server
      .to(message.location)
      .emit(Messages.onSelfharm, this.game.onSelfharm(message));
  }

  // Переход на локацию
  @SubscribeMessage(Messages.relocation)
  async relocation(client, message: IUpdateMessage): Promise<void> {
    console.log('Gateway relocation!!!', message);
    this.game.onRelocation(message);
    this.server.to(message.location).emit(Messages.onRelocation, message.id);
  }
}
