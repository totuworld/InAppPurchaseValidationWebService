import * as boom from 'boom';
import * as debug from 'debug';
import * as http from 'http';

import { App } from './app';

const log = debug('InApp:index');

// 실제 실행문.
(async () => {
  const app = new App();

  const server = http.createServer(app.Server());

  const port = process.env.PORT || 3000;

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    log('Reason: ', reason);
    if (boom.isBoom(reason)) {
      log('unhandledRejection', 'boom');
    }
    log('promise: ', promise);
  });

  server.listen(port, () => {
    log(`🚀 started (port: ${port})`);
  });
})();
