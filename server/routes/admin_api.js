import { Router } from 'express';
import * as db from '../user-database.js';
import { userIsAdmin, getPreviewUserId, setPreviewUserId, getActualUserId } from '../sqlite-session.js'

const router = Router();

router.post('/view_as_user/:id', (req, res) => {
    const userId = Number(req.params.id);
    if (isNaN(userId))
        return res.sendStatus(400);
    setPreviewUserId(req.session, userId)
    res.sendStatus(200);
})

router.post('/attendees/:id', (req, res) => {
    const userId = Number(req.params.id);
    if (isNaN(userId))
        return res.sendStatus(400);
    const { name: attendeeName } = req.body;
    console.log('POST /attendees received: id=' + userId + ', name=' + String(attendeeName));
    const result = db.addAttendee(userId, attendeeName);
    console.log('attendees creation result: ' + JSON.stringify(result));
    res.sendStatus(result.changes === 1 ? 200 : 400);
})

router.post('/user', (req, res) => {
    const { email, names, lang, token } = req.body;
    console.log('POST /user received: ' + JSON.stringify(req.body));
    const result = db.createUser({ email: email, names: names, lang: lang, token: token ?? undefined });
    console.log('user creation result: ' + JSON.stringify(result));
    res.sendStatus(200);
})

function HasUnexpectedKey(object, expectedParams = []) {
    return !Object.keys(object).every(k => expectedParams.includes(k));
}

router.patch('/user/:id', (req, res) => {
    const userId = Number(req.params.id);
    if (isNaN(userId))
        return res.sendStatus(400);
    const expectedFields = ['lang', 'rsvp_limit_time'];
    console.log(`patch '/user': ${JSON.stringify(req.body)}`);
    if (HasUnexpectedKey(req.body, expectedFields)) {
        return res.status(400)
            .send('Unexpected parameters: ' + Object.keys(req.body).filter(k => !expectedFields.includes(k)));
    }
    const { lang, rsvp_limit_time } = req.body;
    const dbResult = db.updateUser(userId, { lang: lang, rsvp_limit_time: rsvp_limit_time });
    res.sendStatus((dbResult?.changes === 1) ? 200 : 400);
})

router.delete('/user/:id', (req, res) => {
    const userId = Number(req.params.id);
    if (isNaN(userId))
        return res.sendStatus(400);
    if (userIsAdmin(userId))
        return res.sendStatus(403);
    // if we delete the preview user, fall back to admin user
    if (getPreviewUserId(req.session) === userId)
        setPreviewUserId(req.session, getActualUserId(req.session));
    res.send(db.deleteUser(userId))
})

router.get('/users', (_req, res) => {
    res.send(db.getAllUsers());
});

router.get('/attendees', (_req, res) => {
    res.send(db.getAllAttendeesData());
});

router.patch('/dismiss_admin_notifications', (req, res) => {
    console.log(JSON.stringify(req.session));
    const dbResult = db.updateUser(getActualUserId(req.session), { last_viewed_notification: (new Date()).toISOString() });
    console.log(`dismiss_admin_notifications - dbResult?.changes ${JSON.stringify(dbResult?.changes)}`);
    res.sendStatus((dbResult?.changes === 1) ? 200 : 400);
});

function getTodayString() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();
    let hh = today.getHours();
    let MM = today.getMinutes();
    let ss = today.getSeconds();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    if (hh < 10) hh = '0' + hh;
    if (MM < 10) MM = '0' + MM;
    if (ss < 10) ss = '0' + ss;

    return `${yyyy}-${mm}-${dd}_${hh}${MM}${ss}`;
}

router.get('/database', (_req, res) => {
    const userFilename = `anavlad-backup-${getTodayString()}.db`;
    console.log(`serving ${db.Filename} as ${userFilename}`);
    res.download(db.Filename, userFilename);
});

export default router;
