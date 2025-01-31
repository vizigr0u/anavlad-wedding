import * as fs from 'fs';
import session from 'express-session';
import sqlite from 'better-sqlite3';
import store_ctor from 'better-sqlite3-session-store';
import config, { Debug } from './config.js';
import * as userdb from './user-database.js'

export function sqliteSession() {
    const session_store = store_ctor(session);

    const DatabaseDir = config.databaseDirectory;
    if (!fs.existsSync(DatabaseDir)) {
        console.log("creating directory databases");
        fs.mkdirSync(DatabaseDir);
    }

    const db = new sqlite(`${config.databaseDirectory}/sessions.db`);

    return session({
        store: new session_store({
            client: db,
            expired: {
                clear: true,
                intervalMs: 900000 //ms = 15min
            }
        }),
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { sameSite: 'strict' }
    });
}

export function getSessionAdminData(session) {
    if (!sessionIsAdmin(session))
        return undefined;
    const adminUser = userdb.getUser(Debug.bypassAuth ? 1 : session.userId);
    return {
        previewUserId: session.previewUserId,
        lastViewedNotif: adminUser.last_viewed_notification
    };
}

export function setPreviewUserId(session, userId) {
    console.log("previewing as " + typeof userId + " " + userId);
    session.previewUserId = userId;
}

export function getActualUserId(session) {
    if (sessionIsAdmin(session))
        return Debug.bypassAuth ? Debug.userId : session.userId;
    return session.userId;
}

export function getPreviewUserId(session) {
    if (sessionIsAdmin(session))
        return session.previewUserId ?? (Debug.bypassAuth ? Debug.userId : session.userId);
    return session.userId;
}

export function sessionIsAuthed(session) {
    return Debug.bypassAuth || !!session.userId;
}

export function userIsAdmin(userId) {
    // TODO more admins?
    return userId === 1;
}

export function sessionIsAdmin(session) {
    return userIsAdmin(Debug.bypassAuth ? Debug.userId : session.userId)
};

export function login(userId, req) {
    if (Debug.bypassAuth)
        return;
    req.session.userId = userId;
    // req.session.regenerate(function (err) {
    //     if (err)
    //         throw err

    //     // store user information in session, typically a user id
    //     req.session.userId = userId;

    //     // save the session before redirection to ensure page
    //     // load does not happen before session is savedlog
    //     req.session.save(function (err) {
    //         if (err)
    //             throw err
    //     })
    // })
}

export function logout(req) {
    if (Debug.bypassAuth)
        return;

    req.session.destroy(function (err) {
        if (err) {
            console.log("error logging out");
            throw err;
        }
    });
}
