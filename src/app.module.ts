import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
// Modules
import { UserModule } from './modules/user/user.module';
import { AccountModule } from './modules/account/account.module';
import { TransactionModule } from './modules/transaction/transaction.module';
// Controllers
import { AppController } from './app.controller';
// Services
import { AppService } from './app.service';
// Entities
import { User } from './modules/user/user.entity';
import { Account } from './modules/account/account.entity';
// Middleware
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
// Config
import { ConfigModule } from '@nestjs/config';
// TypeORM
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'src/config/.env',
      isGlobal: true, // optional, but recommended if used across the app
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Account],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UserModule,
    AccountModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
