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
        if (error.code === 'ENOENT') {
            console.warn(`Using default config, unable to read ${filename}: ${error}`);
        } else {
            console.error(`Unable to read ${filename}: ${error}`);
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
