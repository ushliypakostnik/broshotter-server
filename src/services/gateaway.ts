// Library
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

// Types
import { TUpdateMessage } from '../models/models';

// Constants
import { Messages } from '../models/models';

// Services
import { Game } from '../services/game/game';

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
    this._game = new Game();

    // Запускаем постоянные обновления клиентов
    this._timeout = setInterval(
      () => this.getGame(),
      process.env.TIMEOUT as unknown as number,
    );
  }

  getGame(): void {
    if (this.server) {
      // console.log('Gateaway getGame() timeout!');
      this.server.emit(Messages.updateToClients, this._game.getGame());
    }
  }

  async handleConnection(T): Promise<typeof T> {
    // Присоединился пользователь
    console.log('Gateaway handleConnection() connect!');
    this.server.emit(Messages.onConnect, this._game.getGame());
  }

  async handleDisconnect(T): Promise<typeof T> {
    // Пользователь отвалился
    console.log('Gateaway handleDisconnect()!');
  }

  @SubscribeMessage(Messages.onOnConnect)
  async onOnConnect(): Promise<void> {
    this._game.addUser();
    console.log('Gateaway onOnConnect()!');
  }

  @SubscribeMessage(Messages.updateToServer)
  async onUpdateToServer(client, message: TUpdateMessage): Promise<void> {
    this._game.setUser(message);
    console.log('Gateaway onUpdateToServer()!');
    client.emit(Messages.onUpdateToServer);
  }
}
