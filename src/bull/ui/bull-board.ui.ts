import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { ConfigService } from '../../config/config.service';
import { LoggerService } from '../../logger';
import { IBullUi } from '../bull.interfaces';

export class BullBoardUi implements IBullUi {
  private readonly _ui: ExpressAdapter; //ReturnType<typeof createBullBoard>;
  private readonly _board: ReturnType<typeof createBullBoard>;

  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this._ui = new ExpressAdapter();
    this._ui.setBasePath('/queues');

    this._board = createBullBoard({
      queues: [],
      serverAdapter: this._ui,
      options: {
        uiConfig: {
          boardTitle:
            this.configService.config.BULL_BOARD_TITLE.length > 10
              ? `${this.configService.config.BULL_BOARD_TITLE.slice(0, 10)}...`
              : this.configService.config.BULL_BOARD_TITLE,
          boardLogo: {
            ...(this.configService.config.BULL_BOARD_AVATAR && {
              path: 'https://breet.app/favicon.png',
              width: '40%',
              height: '100%',
            }),
            ...(this.configService.config.BULL_BOARD_FAVICON && {
              favIcon: this.configService.config.BULL_BOARD_FAVICON,
            }),
          },
        },
      },
    });
  }

  addQueue(queuePrefix: string, queueName: string, queue: Queue) {
    this._board.addQueue(new BullMQAdapter(queue));
  }

  removeQueue(queuePrefix: string, queueName: string) {
    this._board.removeQueue(queueName);
  }

  get middleware() {
    return this._ui.getRouter();
  }
}
