import { NestFactory } from '@nestjs/core';
import { App } from './app';

async function bootstrap() {
  const app = await NestFactory.create(App);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
