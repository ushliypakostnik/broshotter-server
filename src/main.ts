import { NestFactory } from '@nestjs/core';
import { App } from './modules/app';

async function bootstrap() {
  const app = await NestFactory.create(App);
  if (process.env.NODE_ENV === 'development') app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
