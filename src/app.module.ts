import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'src/config/.env',
      isGlobal: true, // optional, but recommended if used across the app
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
