import { sessionIsAuthed, login as session_login, sessionIsAdmin } from './sqlite-session.js';
import * as db from './user-database.js';

/**
 * Logs the user in with a token.
 *
 * @param {string} token - a user token
 * @param {Express.Request} req - the express request object
 * @returns {boolean} whether the login was successful
 */
function loginWithToken(token, req) {
    const userId = db.getUserId(token);
    if (!userId)
        return false;
    try {
        session_login(userId, req);
        const res = db.updateUserLogin(userId);
        console.log('login DB update res: ' + JSON.stringify(res));
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Express middleware to require authentication for a route.
 * If the session is not authenticated, attempts to authenticate using a token from the query.
 * Sends a 401 status if authentication fails or no token is provided.
 * Proceeds to the next middleware if authentication is successful.
 * @param {Express.Request} req - Express request object
 * @param {Express.Response} res - Express response object
 * @param {Function} next - Express next function
 */

export function requireAuth(req, res, next) {
    if (!sessionIsAuthed(req.session)) {
        const { token } = req.query;
        if (!token) {
            return res.sendStatus(401);
        }
        if (!loginWithToken(token, req))
            return res.status(401).send('Unable to log in with token ' + token);
    }
    next();
}

/**
* Express middleware to check if the user is authenticated as an admin.
* @param {Express.Request} req Express request
* @param {Express.Response} res Express response
* @param {Function} next Express next function
*/
export function requireAdmin(req, res, next) {
    if (!sessionIsAuthed(req.session))
        res.sendStatus(401)
    else if (!sessionIsAdmin(req.session))
        res.sendStatus(403)
    else next()
}