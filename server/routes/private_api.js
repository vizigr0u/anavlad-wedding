import { Router } from 'express';
import * as db from '../user-database.js'
import { getPreviewUserId, logout, sessionIsAdmin } from '../sqlite-session.js'
import getWeddingData from '../weddingdata-loader.js';

const router = Router();

function HasUnexpectedKey(object, expectedParams = []) {
    return !Object.keys(object).every(k => expectedParams.includes(k));
}

router.patch('/user', (req, res) => {
    const expectedFields = ['attendees', 'lang', 'last_viewed_notification'];
    console.log(`patch '/user': ${JSON.stringify(req.body)}`);
    if (HasUnexpectedKey(req.body, expectedFields)) {
        return res.status(400)
            .send('Unexpected parameters: ' + Object.keys(req.body).filter(k => !expectedFields.includes(k)));
    }
    const { lang, last_viewed_notification, attendees } = req.body;
    const userId = getPreviewUserId(req.session);
    if (lang || last_viewed_notification) {
        const result = db.updateUser(userId, { lang: lang, last_viewed_notification: last_viewed_notification });
        if (result?.changes !== 1)
            return res.status(400)
                .send('Unable to update user: ' + JSON.stringify(result));
    }
    if (attendees) {
        if (!Array.isArray(attendees)
            || attendees.some(att => typeof att !== 'object'
                || Object.keys(att) < 2
                || Number(att.id) < 1)) {
            return res.status(400)
                .send('Unexpected attendee data: ' + JSON.stringify(attendees));
        }
        if (!sessionIsAdmin(req.session)) {
            const { rsvp_limit_time } = db.getUser(userId);
            const limitDate = new Date(rsvp_limit_time ?? weddingData.answer_date);
            var tooLate = limitDate;
            tooLate.setDate(limitDate.getDate() + 1);
            if (new Date() >= tooLate)
                return res.status(400).send(`Unable to update attendees: max. date was ${limitDate.toLocaleDateString()}.`);
        }
        var error = undefined;
        attendees.forEach(att => {
            const userFields = {
                name: att.name,
                rsvp_answer: att.rsvpAnswer,
                comment: att.comment,
                food_preferences: att.foodPreferences
            };
            const result = db.updateAttendee(userId, att.id, userFields);
            console.log('attendees update result: ' + JSON.stringify(result));
            if (result?.changes !== 1) {
                error = 'Unable to update attendee: ' + JSON.stringify(result);
                return;
            }
        });
        if (error) {
            return res.status(400).send(error);
        }
    }
    res.sendStatus(200);
});

router.patch('/carpools', (req, res) => {
    const expectedFields = ['name', 'seats', 'languages', 'message', 'contact'];
    const userId = getPreviewUserId(req.session);
    console.log(`patch '/carpools': ${JSON.stringify(req.body)}`);
    if (HasUnexpectedKey(req.body, expectedFields)) {
        return res.status(400)
            .send('Unexpected parameters: ' + Object.keys(req.body).filter(k => !expectedFields.includes(k)));
    }
    const { name, seats, languages, message, contact } = req.body;
    const fields = {
        name: name,
        seats: seats,
        spoken_languages: (Array.isArray(languages) && languages.length > 0) ? JSON.stringify(languages) : undefined,
        message: message,
        how_to_contact: contact
    };
    const result = db.updateCarpool(userId, fields);
    if (result?.changes !== 1) {
        return res.status(400).send('Unable to update carpool: ' + JSON.stringify(result));
    }
    res.sendStatus(200);
});

router.delete('/carpools', (req, res) => {
    console.log(`delete '/carpools'`);
    const userId = getPreviewUserId(req.session);
    try {
        const dbResult = db.removeCarpool(userId);
        console.log(JSON.stringify(dbResult));
        res.sendStatus((dbResult?.changes === 1) ? 200 : 400);
    }
    catch (err) {
        res.status(400).send(err);
    }
});

router.post('/carpools', (req, res) => {
    const expectedFields = ['name', 'seats', 'languages', 'message', 'contact'];
    console.log(`post '/carpools': ${JSON.stringify(req.body)}`);
    if (HasUnexpectedKey(req.body, expectedFields)) {
        return res.status(400)
            .send('Unexpected parameters: ' + Object.keys(req.body).filter(k => !expectedFields.includes(k)));
    }
    const { name, seats, languages, message, contact } = req.body;
    const userId = getPreviewUserId(req.session);
    try {
        const dbResult = db.addCarpool(userId, name, seats, languages, message, contact);
        console.log(JSON.stringify(dbResult));
        res.sendStatus((dbResult?.changes === 1) ? 200 : 400);
    }
    catch (err) {
        console.log('error adding carpool: ' + err);
        res.status(400).send(err);
    }
});

router.get('/carpools', (req, res) => {
    console.log(`get '/carpools'`);
    res.send(db.getCarpools().map(c => ({
        name: c.name,
        contact: c.how_to_contact,
        isMine: c.user_id === getPreviewUserId(req.session),
        seats: c.seats,
        languages: JSON.parse(c.spoken_languages),
        message: c.message
    })));
});

router.patch('/dismiss_notifications', (req, res) => {
    const dbResult = db.updateUser(getPreviewUserId(req.session), { last_viewed_notification: (new Date()).toISOString() });
    console.log(`dismiss_notifications - dbResult?.changes ${JSON.stringify(dbResult?.changes)}`);
    res.sendStatus((dbResult?.changes === 1) ? 200 : 400);
});

router.get('/bank-info', async (_req, res) => {
    const weddingData = await getWeddingData();
    const response = { paymentMethods: weddingData.payment_methods };
    console.log('sending bank-info: ' + JSON.stringify(response));
    res.send(response);
});

router.get('/logout', (req, res, next) => {
    try {
        logout(req);
        res.sendStatus(200);
    }
    catch (err) {
        next(err)
    }
});

export default router;
