// Library
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

// Services
import { Users } from '../services/users';

@WebSocketGateway({
  cors: {
    credentials: true
  },
  allowEIO3: true,
})
export default class Gateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server;

  // Gameplay
  private _users: Users;

  constructor() {
    this._users = new Users();
  }

  async handleConnection() {
    // A client has connected
    // Notify connected clients of current users
    // this.server.emit('users', {});
    console.log('Gateaway handleConnection()!');
  }

  async handleDisconnect() {
    // A client has disconnected
    // Notify connected clients of current users
    // this.server.emit('users', {});
    console.log('Gateaway handleDisconnect()!');
  }

  @SubscribeMessage('test')
  async onEnter(client, message) {
    client.emit('onEnter', message);
    console.log('Gateaway onEnter()!', message);
  }
}
