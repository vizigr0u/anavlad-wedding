import sqlite from 'better-sqlite3';
import { randomBytes } from 'node:crypto';
import base64url from "base64url";
import * as fs from 'fs';
import config from './config.js';

const DatabaseDir = config.databaseDirectory;
export const Filename = DatabaseDir + '/anavlad.db';
const schemaVersionFilename = DatabaseDir + '/schema.version';
const LastSchemaVersion = 7;

function countDbUsers(db) {
    const res = db.prepare('SELECT COUNT(*) as count FROM users').get();
    return res?.count;
}

function getDbUser(db, userId) {
    return db.prepare('SELECT * FROM users WHERE user_id=?')
        .get(Number(userId));
}

function makeInsertQuery(tableName, columnNames) {
    return `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${columnNames.map(p => '?').join(', ')})`;
}

function makeUpdateQuery(tableName, columnNames) {
    return 'UPDATE ' + tableName + ' SET ' + columnNames.map(p => p + '=? ');
}

function createDbUser(db, { email, names, lang, token = generateToken(config.userTokenLength) } = {}) {
    const columnNames = ['email', 'lang', 'token'];
    const keyValues = columnNames.map(k => [k, eval(k)]).filter(kv => kv[1] !== undefined && kv[1] !== null);
    const [keys, values] = [keyValues.map(kv => kv[0]), keyValues.map(kv => kv[1])];
    const createUserQuery = makeInsertQuery('users', keys);
    console.log(`keyValues: ${JSON.stringify(keyValues)}, query: ${createUserQuery}`);

    const makeUser = db.prepare(createUserQuery);
    const makeAttendee = db.prepare('INSERT INTO attendees (user_id,name) VALUES(?,?)');
    const makeAll = db.transaction((names, values) => {
        const result = makeUser.run(...values);
        const userId = result.lastInsertRowid;
        names.forEach(name => {
            makeAttendee.run(userId, name);
        });
    });
    makeAll(names, values);
}

function InitUserDb() {
    if (!fs.existsSync(DatabaseDir)) {
        console.log("creating directory databases");
        fs.mkdirSync(DatabaseDir);
    }

    const dbExisted = fs.existsSync(Filename);
    const db = sqlite(Filename, { fileMustExist: false, verbose: console.log });

    let updateSchemaVersion = false;
    if (!dbExisted) {
        CreateDatabaseSchema(db);
        updateSchemaVersion = true;
    } else {
        updateSchemaVersion = UpdateDatabaseSchema(db);
    }
    if (updateSchemaVersion) {
        fs.writeFile(schemaVersionFilename, String(LastSchemaVersion), err => {
            if (err) {
                console.error("error writing to file " + schemaVersionFilename + ": " + err);
            }
        });
    }
    const adminToken = getDbUser(db, 1)?.token;
    const loginUri = `${config.domain}?token=${adminToken}`;
    console.log(`admin token: ${adminToken} - you should be able to log at ${loginUri}`);

    return db;
};

function CreateDatabaseSchema(db) {
    function runQuery(query, verbose = 0) {
        if (verbose > 0)
            console.debug('query: ' + query);
        const res = db.prepare(query).run();
        if (verbose > 0)
            console.debug('result: ' + JSON.stringify(res))
    }

    const default_lang = "en";
    runQuery(`CREATE TABLE IF NOT EXISTS \n\
    users(\n\
        user_id INTEGER PRIMARY KEY, \n\
        token TEXT NOT NULL UNIQUE, \n\
        email TEXT, \n\
        last_login TEXT, \n\
        last_viewed_notification TEXT, \n\
        login_count INTEGER DEFAULT 0 NOT NULL, \n\
        rsvp_limit_time INTEGER DEFAULT NULL, \n\
        lang TEXT DEFAULT ${default_lang} \n\
    );`);
    runQuery(`CREATE TABLE IF NOT EXISTS \n\
    attendees(\n\
        attendee_id INTEGER PRIMARY KEY, \n\
        user_id INTEGER, \n\
        name TEXT DEFAULT NULL, \n\
        rsvp_answer INTEGER DEFAULT NULL, \n\
        food_preferences TEXT, \n\
        last_edit TEXT, \n\
        comment TEXT DEFAULT "", \n\
        FOREIGN KEY(user_id) REFERENCES users(user_id)\n\
    );`);
    runQuery('CREATE TABLE IF NOT EXISTS \n\
    guestbook_entries(\n\
        entry_id INTEGER PRIMARY KEY, \n\
        user_id INTEGER NOT NULL, \n\
        datetime TEXT NOT NULL, \n\
        name TEXT, \n\
        message TEXT NOT NULL, \n\
        is_public INTEGER DEFAULT 0 NOT NULL, \n\
        FOREIGN KEY(user_id) REFERENCES users(user_id)\n\
    );');
    runQuery('CREATE TABLE IF NOT EXISTS \n\
    carpoolers(\n\
        carpooler_id INTEGER PRIMARY KEY, \n\
        user_id INTEGER NOT NULL UNIQUE, \n\
        name TEXT NOT NULL, \n\
        seats INTEGER DEFAULT 1 NOT NULL, \n\
        spoken_languages TEXT, \n\
        message TEXT NOT NULL, \n\
        how_to_contact TEXT NOT NULL, \n\
        FOREIGN KEY(user_id) REFERENCES users(user_id)\n\
    );');

    const adminToken = generateToken(config.adminTokenLength);
    console.log('No admin! Creating one with token ' + adminToken)
    createDbUser(db, { names: ['admin'], token: adminToken });

    return db;
}

function UpdateDatabaseSchema(db) {
    function runQuery(query, verbose = 0) {
        if (verbose > 0)
            console.debug('query: ' + query);
        const res = db.prepare(query).run();
        if (verbose > 0)
            console.debug('result: ' + JSON.stringify(res))
    }
    let currentDbSchemaVersion = 0;
    if (fs.existsSync(schemaVersionFilename)) {
        const content = fs.readFileSync(schemaVersionFilename, 'utf8');
        currentDbSchemaVersion = parseInt(content);
    }
    console.log(`current db schema version: ${currentDbSchemaVersion} - expected: ${LastSchemaVersion}`);
    if (currentDbSchemaVersion < 7) {
        runQuery('CREATE TABLE IF NOT EXISTS \n\
            carpoolers(\n\
                carpooler_id INTEGER PRIMARY KEY, \n\
                user_id INTEGER NOT NULL UNIQUE, \n\
                name TEXT NOT NULL, \n\
                seats INTEGER DEFAULT 1 NOT NULL, \n\
                spoken_languages TEXT, \n\
                message TEXT NOT NULL, \n\
                how_to_contact TEXT NOT NULL, \n\
                FOREIGN KEY(user_id) REFERENCES users(user_id)\n\
            );', 1);
    }
    return true;
}

const db = InitUserDb();

export const countUsers = () => countDbUsers(db);

export function updateUserLogin(userId) {
    const res = db.prepare('UPDATE users SET login_count=login_count + 1, last_login=? WHERE user_id=?')
        .run((new Date()).toISOString(), userId);
    return res;
}

export function getUserId(token) {
    const res = db.prepare('SELECT user_id FROM users WHERE token=?')
        .get(token);
    return res?.user_id;
}

export const getUser = userId => getDbUser(db, userId);

export function getAttendees(userId) {
    return db.prepare('SELECT attendee_id, name, rsvp_answer, food_preferences, comment FROM attendees WHERE user_id=?')
        .all(Number(userId));
}

// unused
// export function getAllUserData() {
//     return db.prepare('SELECT * FROM "attendees" INNER JOIN users USING (user_id)')
//         .all();
// }

export function getAllAttendeesData() {
    return db.prepare('SELECT attendee_id, user_id, name, rsvp_answer, food_preferences, last_edit, comment, email\
    FROM "attendees" NATURAL JOIN users\
    ORDER BY user_id')
        .all();
}

export function getAllUsers() {
    return db.prepare('SELECT * FROM users')
        .all();
}

export function addAttendee(userId, name) {
    const makeAttendee = db.prepare('INSERT INTO attendees (user_id,name) VALUES(?,?)');
    return makeAttendee.run(userId, name ?? '?');
}

export function createUser({ email, names, lang, token = generateToken(config.userTokenLength) } = {}) {
    return createDbUser(db, { email: email, names: names, lang: lang, token: token });
}

export function addCarpool(userId, name, seats, spoken_languages, message, how_to_contact) {
    const makeCarpooler = db.prepare('INSERT INTO carpoolers (user_id, name, seats, spoken_languages, message, how_to_contact) VALUES(?,?,?,?,?,?)');
    return makeCarpooler.run(userId, name, seats, JSON.stringify(spoken_languages), message ?? '', how_to_contact);
}

export function removeCarpool(userId) {
    const deleteCarpool = db.prepare('DELETE FROM carpoolers WHERE user_id=?');
    return deleteCarpool.run(userId);
}

export function updateCarpool(userId, { name, seats, spoken_languages, message, how_to_contact } = {}) {
    const columnNames = ['seats', 'name', 'spoken_languages', 'message', 'how_to_contact'];
    const keyValues = columnNames.map(k => [k, eval(k)]).filter(kv => kv[1] !== undefined && kv[1] !== null);
    const [keys, values] = [keyValues.map(kv => kv[0]), keyValues.map(kv => kv[1]).concat([userId])];
    if (!keys.length)
        return false;
    const query = makeUpdateQuery('carpoolers', keys) + ' WHERE user_id=?';
    console.log('carpoolers update query: ' + query);
    const update = db.prepare(query);
    return update.run(...values);
}

export function getCarpool(userId) {
    return db.prepare('SELECT * FROM carpoolers WHERE user_id=?')
        .get(userId);
}

export function getCarpools() {
    return db.prepare('SELECT * FROM carpoolers')
        .all();
}

export function deleteUser(userId) {
    const deleteGuestbookEntries = db.prepare('DELETE FROM guestbook_entries WHERE user_id=?');
    const deleteAttendees = db.prepare('DELETE FROM attendees WHERE user_id=?');
    const deleteUser = db.prepare('DELETE FROM users WHERE user_id=?');
    const deleteAll = db.transaction(userId => {
        deleteGuestbookEntries.run(userId);
        deleteAttendees.run(userId);
        deleteUser.run(userId);
    });
    deleteAll(userId);
}

export function updateUser(userId, { email, lang, last_viewed_notification, rsvp_limit_time } = {}) {
    const columnNames = ['email', 'lang', 'last_viewed_notification', 'rsvp_limit_time'];
    const keyValues = columnNames.map(k => [k, eval(k)]).filter(kv => kv[1] !== undefined && kv[1] !== null);
    const [keys, values] = [keyValues.map(kv => kv[0]), keyValues.map(kv => kv[1]).concat([userId])];
    if (!keys.length)
        return false;
    const query = makeUpdateQuery('users', keys) + ' WHERE user_id=?';
    console.log('user update query: ' + query);
    const update = db.prepare(query);
    return update.run(...values);
}

export function updateAttendee(userId, attendeeId, { name, rsvp_answer, food_preferences, comment } = {}) {
    const columnNames = ['name', 'rsvp_answer', 'food_preferences', 'comment'];
    let keyValues = columnNames.map(k => [k, eval(k)]).filter(kv => kv[1] !== undefined && kv[1] !== null);
    keyValues.push(['last_edit', (new Date()).toISOString()]);
    const [keys, values] = [keyValues.map(kv => kv[0]), keyValues.map(kv => kv[1]).concat([attendeeId, userId])];
    if (!keys.length)
        return false;
    const query = makeUpdateQuery('attendees', keys) + ' WHERE attendee_id=? AND user_id=?';
    console.log('user attendee query: ' + query);
    const update = db.prepare(query);
    return update.run(...values);
}

export function generateToken(length = 20) {
    return base64url(randomBytes(length)); //.toString('hex');
}
