import 'reflect-metadata';
import * as express from 'express';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import { Environment } from './Environment';
import { exceptionHandler, extendExpressResponse } from './api';
import { Log } from './log';

const log = new Log('core:Bootstrap');

/**
 * This class helps us to create an express app very easy and moreover
 * to give us a better possibility to extend the bootstrap process
 *
 * @export
 * @class Bootstrap
 */
export class Bootstrap {

    /**
     * Returns a basic express application with some configurations
     * like host and port.
     *
     * @static
     * @returns {express.Application}
     *
     * @memberof Bootstrap
     */
    static getApp(): express.Application {
        const app = express();

        // Set serve configs for running it
        app.set('host', Environment.get('APP_HOST'));
        app.set('port', Bootstrap.normalizePort(Environment.get<string>('PORT') || Environment.get<string>('APP_PORT')));
        log.debug('app is defined');
        return app;
    }

    /**
     * Binds the express application and the ioc container together,
     * so we can use the awesome annotations of the inversify library.
     *
     * @static
     * @param {express.Application} app
     * @param {Container} container
     * @returns {express.Application}
     *
     * @memberof Bootstrap
     */
    static build(app: express.Application, container: Container): express.Application {
        let server = new InversifyExpressServer(container, undefined, { rootPath: Environment.get<string>('APP_URL_PREFIX') }, app);
        log.debug('ioc is bonded');
        server.setConfig((a) => a.use(extendExpressResponse));
        server.setErrorConfig((a) => a.use(exceptionHandler));
        return server.build();
    }

    /**
     * Well this method just normalizes the given port :-)
     *
     * @static
     * @param {string} port
     * @returns {(number | string | boolean)}
     *
     * @memberof Bootstrap
     */
    static normalizePort(port: string): number | string | boolean {
        const parsedPort = parseInt(port, 10);
        if (isNaN(parsedPort)) { // named pipe
            return port;
        }
        if (parsedPort >= 0) { // port number
            return parsedPort;
        }
        return false;
    }

}