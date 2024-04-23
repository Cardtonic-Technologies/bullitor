import { LOG_LEVELS } from '@app/logger/common';
import { Injectable } from '@nestjs/common';
import { bool, cleanEnv, num, port, str } from 'envalid';

@Injectable()
export class ConfigService {
  private readonly _config = cleanEnv(process.env, {
    /**
     * Collect NodeJS metrics (default: false)
     */
    COLLECT_NODEJS_METRICS: bool({ default: false }),
    /**
     * Collect Node.js metrics ever N milliseconds (default 60 seconds)
     */
    COLLECT_NODEJS_METRICS_INTERVAL_MS: num({ default: 60000 }),
    /**
     * Disable logging (only permitted when NODE_ENV is 'test')
     */
    DISABLE_LOGGING: bool({ default: false }),
    /**
     * Automatically update redis configuration (false requires you
     * to manually set keyspace notifications)
     */
    REDIS_CONFIGURE_KEYSPACE_NOTIFICATIONS: bool({ default: true }),
    /**
     * Redis database number
     */
    REDIS_CONN_STRING: str({ default: '' }),
    /**
     * Bull Board Title
     */
    BULL_BOARD_TITLE: str({ default: 'BULL DASHBOARD' }),
    /**
     * Bull Board Avatar URL
     */
    BULL_BOARD_AVATAR: str({ default: '' }),
    /**
     * Bull Board Favicon URL
     */
    BULL_BOARD_FAVICON: str({ default: '' }),
    /**
     * Redis database number
     */
    REDIS_DB: num({ default: 0 }),
    /**
     * Redis host to fetch queues from
     */
    REDIS_HOST: str({ default: '' }),
    /**
     * Redis username (if needed)
     */
    REDIS_USERNAME: str({ default: '' }),
    /**
     * Redis port to fetch queues from
     */
    REDIS_PORT: port({ default: 6379 }),
    /**
     * Redis SSL enabled
     */
    REDIS_TLS: bool({ default: false }),
    /**
     * Redis password (if needed)
     */
    REDIS_PASSWORD: str({ default: '' }),
    /**
     * Comma separate list of BullMQ queue prefixes to
     * monitor (default: bull)
     */
    BULL_WATCH_QUEUE_PREFIXES: str({ default: 'bull' }),
    /**
     * Fetch queue metrics ever N milliseconds (default 60 seconds)
     */
    BULL_COLLECT_QUEUE_METRICS_INTERVAL_MS: num({ default: 60000 }),
    /**
     * Default log label to use
     */
    LOG_LABEL: str({ default: 'bullitor' }),
    /**
     * Logging level to use
     */
    LOG_LEVEL: str({
      choices: [
        LOG_LEVELS.DEBUG,
        LOG_LEVELS.ERROR,
        LOG_LEVELS.INFO,
        LOG_LEVELS.WARN,
      ],
      default: LOG_LEVELS.INFO,
    }),
    /**
     * NodeJS environment name
     */
    NODE_ENV: str({ default: 'production' }),
    /**
     * Default port to use
     */
    PORT: port({ default: 3000 }),
    /**
     * Delay time before restarting process
     */
    RESTART_DELAY_MS: num({ default: 1000 }),
    /**
     * Version
     */
    VERSION: str({ default: 'local' }),
  });

  get config() {
    return this._config;
  }
}
