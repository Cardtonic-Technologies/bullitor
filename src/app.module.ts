import { NotFoundExceptionFilter } from '@app/auth/local-auth.guard';
import { HealthcheckModule } from '@app/healthcheck/healthcheck.module';
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from './bull/bull.module';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { LoggerModule } from './logger';
import { MetricsModule } from './metrics';
import { VersionModule } from './version/version.module';

@Module({
  providers: [{ provide: APP_FILTER, useClass: NotFoundExceptionFilter }],
  imports: [
    BullModule,
    EventEmitterModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          env: configService.config.NODE_ENV,
          label: configService.config.LOG_LABEL,
          level: configService.config.LOG_LEVEL,
          silent: configService.config.DISABLE_LOGGING,
        };
      },
    }),
    ConfigModule,
    HealthcheckModule,
    MetricsModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          collectDefaultMetrics: configService.config.COLLECT_NODEJS_METRICS,
          collectMetricsEveryNMilliseconds:
            configService.config.COLLECT_NODEJS_METRICS_INTERVAL_MS,
        };
      },
    }),
    VersionModule,
  ],
})
export class AppModule {}
