import express, { Router } from 'express';
import config from '../config.js';
import { getPhotos } from '../process-photos.js';

const router = Router();

router.get('/', async (_req, res) => {
    const photos = await getPhotos();
    if (!photos)
        return res.status(400).send(JSON.stringify(error));
    res.send(photos);
});

router.get('/:filename', express.static(config.photosDirectory));
router.get('/thumbs/:filename', express.static(config.photosDirectory));

export default router;
