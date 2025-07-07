import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      `http://localhost:3000`,
      'https://your-frontend.com',
      'http://192.168.1.7:3000',
      'https://api.xpnse-diary.vasaniyakush.me',
      'https://account-management-server-7jvo.onrender.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip non-decorated fields
      transform: true, // Enables automatic type conversion
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
