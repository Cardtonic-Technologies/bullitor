import { AuthMiddleware } from '@app/auth/auth.middleware';
import { AuthModule } from '@app/auth/auth.module';
import { ConfigModule } from '@app/config/config.module';
import { ConfigService } from '@app/config/config.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { BullDashboardMiddleware } from './bull-dashboard.middleware';
import { BullMetricsService } from './bull-metrics.service';
import { BullQueuesService } from './bull-queues.service';
import { BullUiService } from './bull-ui.service';
import { REDIS_CLIENTS } from './bull.enums';
import { BullMQMetricsFactory } from './bullmq-metrics.factory';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return [REDIS_CLIENTS.SUBSCRIBE, REDIS_CLIENTS.PUBLISH].map(
          (client) => {
            return {
              name: client,
              maxRetriesPerRequest: null,
              showFriendlyErrorStack: true,
              tls: configService.config.REDIS_TLS ? {} : undefined,
              username: configService.config.REDIS_USERNAME,
              host: configService.config.REDIS_HOST,
              password: configService.config.REDIS_PASSWORD,
              port: configService.config.REDIS_PORT,
              db: configService.config.REDIS_DB,
              enableReadyCheck: true,
              reconnectOnError: () => true,
            };
          },
        );
      },
    }),
  ],
  providers: [
    BullQueuesService,
    BullMetricsService,
    BullUiService,
    BullMQMetricsFactory,
  ],
})
export class BullModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
    consumer
      .apply(AuthMiddleware, BullDashboardMiddleware)
      .forRoutes(this.configService.config.BULL_URL_PATH);
  }
}
