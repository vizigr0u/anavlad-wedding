import { promises as fs } from 'fs';
import config from './config.js';

let data = {};
let dataLoadPromise = null;

async function loadWeddingData() {
    const filename = config.weddingdataFile;
    console.log('Loading event config from ' + filename);
    try {
        const fileContent = await fs.readFile(filename, 'utf8');
        data = JSON.parse(fileContent);
        console.log('Event config loaded from ' + filename);
    } catch (error) {
        if (error.code === 'ERR_MODULE_NOT_FOUND') {
            console.warn('Unable to load event config from ' + filename);
        } else {
            throw error;
        }
    }
}

dataLoadPromise = loadWeddingData();

export async function getWeddingData() {
    await dataLoadPromise;
    return data;
}

export default getWeddingData;
