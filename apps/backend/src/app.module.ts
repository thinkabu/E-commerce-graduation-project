import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';

@Module({
  imports: [
    RecommendationsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    this.connection.on('connected', () => {
      this.logger.log('✅ Kết nối MongoDB thành công!');
    });

    this.connection.on('error', (err) => {
      this.logger.error(`❌ Lỗi MongoDB: ${err.message}`);
    });

    this.connection.on('disconnected', () => {
      this.logger.warn('⚠️ MongoDB đã ngắt kết nối');
    });

    const state = this.connection.readyState;
    const states = {
      0: 'Đã ngắt kết nối',
      1: 'Đã kết nối',
      2: 'Đang kết nối...',
      3: 'Đang ngắt kết nối...',
    };

    this.logger.log(`📊 Trạng thái MongoDB: ${states[state]}`);
  }
}
