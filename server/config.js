import * as dotenv from 'dotenv'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;

console.log(`Loading environment from ${envFile}`);

dotenv.config({ path: path.resolve(__dirname, envFile) })

const port = process.env.PORT || 5000;
const hostname = process.env.HOSTNAME || 'localhost';

const weddingdataFile = process.env.WEDDINGDATA_FILE || './weddingdata.default.json';

const config = {
  nodeEnv,
  hostname,
  port,
  bindAddress: process.env.BIND_ADDRESS || '0.0.0.0',
  domain: process.env.DOMAIN || `http://${hostname}:${port}`,
  sessionSecret: process.env.SESSION_SECRET || 'keyboard cat',
  privateDirectory: process.env.PRIVATE_DIR,
  databaseDirectory: process.env.DATABASE_DIR,
  frontendDirectory: process.env.FRONTEND_DIR,
  photosDirectory: process.env.PHOTOS_DIR,
  weddingdataFile,
  userTokenLength: 10, /* 2022: estimate millions of years to crack for base64url */
  adminTokenLength: 12, /* 2022: estimate billions of years to crack for base64url */
}

if (process.env.WEDDINGDATA_FILE) {
  console.warn('using weddingdata file: ' + weddingdataFile);
}

if (!config.photosDirectory) {
  console.warn('No photos directory provided.');
}

if (!config.privateDirectory) {
  console.warn('No private directory, requests to /private will fail.');
}

export default config;

export const Debug = {
  serverDebug: process.env.SERVER_DEBUG !== undefined,
  bypassAuth: process.env.SERVER_DEBUG !== undefined,
  userId: process.env.OVERRIDE_USER_ID ?? 1,
  userLevel: process.env.OVERRIDE_USER_LEVEL ?? 2,
};
