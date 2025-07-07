import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
// Modules
import { UserModule } from './modules/user/user.module';
import { AccountModule } from './modules/account/account.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
// Controllers
import { AppController } from './app.controller';
// Services
import { AppService } from './app.service';
// Entities
import { User } from './modules/user/user.entity';
import { Account } from './modules/account/account.entity';
import { Transaction } from './modules/transaction/transaction.entity';
import { Viewer } from './modules/user/viewer.entity';
// Middleware
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { AuthMiddleware } from './modules/auth/auth.middleware';

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
      ssl: {
        rejectUnauthorized: false, // For RDS default cert, or you can provide a proper CA if needed
      },
      entities: [User, Account, Transaction, Viewer],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
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
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'users/auth/google', method: RequestMethod.POST },
        { path: 'users', method: RequestMethod.POST },
        { path: 'users/auth/token', method: RequestMethod.GET },
        { path: 'health', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}
