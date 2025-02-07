import { Router } from 'express';
import * as db from '../user-database.js'
import { getPreviewUserId, getSessionAdminData, login as session_login, sessionIsAuthed } from '../sqlite-session.js'
import getWeddingData from '../weddingdata-loader.js';
import config from '../config.js';

const router = Router();

router.get('/', (_req, res) => {
    // todo schema?
    res.send({ message: 'Sorry nothing to see here. Here is a capybara : https://pt.wikipedia.org/wiki/Capivara#/media/Ficheiro:Capybara_(Hydrochoerus_hydrochaeris).JPG' });
});

router.get('/health', (_req, res) => {
    res.sendStatus(200);
});

function loginUser(token, req) {
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

router.get('/user-data', async (req, res) => {
    var userId;
    if (!sessionIsAuthed(req.session)) {
        const { token } = req.query;
        if (!token) {
            return res.send({});
        }
        if (!loginUser(token, req))
            return res.status(401).send('Unable to log in with token ' + token);
        userId = db.getUserId(token);
    } else {
        userId = getPreviewUserId(req.session);
    }
    const user = db.getUser(userId);
    if (!user)
        return res.sendStatus(400);
    const attendees = db.getAttendees(userId).map(att => ({
        'id': att.attendee_id,
        'name': att.name,
        'rsvpAnswer': att.rsvp_answer,
        'foodPreferences': att.food_preferences,
        'comment': att.comment
    }));
    const weddingData = await getWeddingData();
    const eventData = weddingData.event_data;
    const response = {
        lang: user.lang,
        attendees,
        lastViewedNotif: user.last_viewed_notification,
        rsvpLimitDate: new Date(user.rsvp_limit_time ?? weddingData.answer_date),
        weddingData: eventData,
        admin: getSessionAdminData(req.session)
    };

    if (config.nodeEnv === 'development') {
        console.log('sending userData: ' + JSON.stringify(response));
    }

    res.send(response);
});

// router.post('/login/', (req, res) => {
//     const { token } = req.body;
//     if (sessionIsAuthed(req.session)) {
//         return res.sendStatus(401);
//     }
//     if (!loginUser(token, req))
//         return res.sendStatus(401);
//     return res.sendStatus(200);
// });

export default router;
