import express, { json } from 'express';
import { sqliteSession } from './sqlite-session.js';
import { default as public_router } from './routes/public_api.js';
import { default as private_router } from './routes/private_api.js';
import { default as admin_router } from './routes/admin_api.js';
import { default as photos_router } from './routes/photos.js';

import config, { Debug } from './config.js';
import { requireAdmin, requireAuth } from './auth.js';

if (Debug.serverDebug || Debug.bypassAuth) {
  console.warn("----------------------------------------------------------------------\n"
    + "/!\\ SERVER IN DEBUG_MODE /!\\\n"
    + "----------------------------------------------------------------------");
}

const app = express();

app.set('trust proxy', 1);

app.use(json()); // Parse JSON bodies
app.use(sqliteSession()); // express-session store in sqlite db

/**
 * Middleware to log each incoming request.
 * @param {Express.Request} req Express request
 * @param {Express.Response} _res Express response (not used)
 * @param {Function} next Express next function
 * @returns {void}
 */
function logRequest(req, _res, next) {
  console.log(`req: ${JSON.stringify(req.path)}`);
  next();
}

if (config.privateDirectory) {
  app.use('/private', logRequest);
  app.use('/private', requireAuth);
  app.use('/private', express.static(config.privateDirectory));
}

app.use('/photos', requireAuth, photos_router);

app.use('/api', public_router);
app.use('/api', requireAuth, private_router);
app.use('/api', requireAdmin, admin_router);

// used to serve react build folder
// note: on prod we normally let the webserver (e.g. nginx) serve public static files
//       (i.e. that doesn't require authentication)
//       This is mostly for performance reasons.
if (config.frontendDirectory) {
  console.log('Serving frontend static files from: ' + config.frontendDirectory);
  app.use(express.static(config.frontendDirectory));
}

app.listen(config.port, config.bindAddress,
  () => console.log(`${config.nodeEnv} build - ${config.domain} on ${config.bindAddress}:${config.port}`));
