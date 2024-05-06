import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  private readonly configService: ConfigService;

  constructor(configService: ConfigService) {
    this.configService = configService;
  }

  validateAuth(username: string, password: string) {
    if (
      username === (this.configService.config.BULL_BOARD_USERNAME || 'admin') &&
      password === (this.configService.config.BULL_BOARD_PASSWORD || 'admin')
    ) {
      return { user: 'bull-board' };
    }
    return null;
  }
}
