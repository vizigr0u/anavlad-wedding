import { promises as fs } from 'fs';
import path from 'path';
import sizeOf from 'image-size';
import { promisify } from 'util';
import config from './config.js';

// Promisify the sizeOf function to use with async/await
const sizeOfAsync = promisify(sizeOf);

const photosDirectory = config.photosDirectory;
const thumbDirectory = path.join(photosDirectory, 'thumbs');

async function processPhotosAsync() {
    try {
        // Read the photos directory asynchronously
        const photoFiles = await fs.readdir(photosDirectory);

        let thumbDirectoryExists = false;

        // Check if the thumbs directory exists
        try {
            const stats = await fs.stat(thumbDirectory);
            thumbDirectoryExists = stats.isDirectory();
        } catch (err) {
            if (err.code !== 'ENOENT') {
                // Re-throw unexpected errors
                throw err;
            }
            // thumbs directory does not exist
        }

        if (!thumbDirectoryExists) {
            console.warn('Photos directory doesn\'t contain a "thumbs" directory, full photos will be used instead.');
        }

        // Filter out non-JPG files
        const jpgFiles = photoFiles.filter(filename => path.extname(filename).toLowerCase() === ".jpg");

        // Process each photo asynchronously
        const photos = await Promise.all(jpgFiles.map(async (filename) => {
            const fullName = path.join(photosDirectory, filename);
            let dimensions;

            // Get dimensions of the original image
            try {
                dimensions = await sizeOfAsync(fullName);
            } catch (err) {
                console.error(`Failed to get dimensions for ${fullName}:`, err);
                return null; // Skip this file if dimensions can't be read
            }

            let thumbnailFullName = fullName;
            let thumbnailFound = false;

            if (thumbDirectoryExists) {
                const thumbnailPath = path.join(thumbDirectory, filename);
                try {
                    // Check if the thumbnail exists
                    await fs.access(thumbnailPath);
                    thumbnailFullName = thumbnailPath;
                    thumbnailFound = true;
                } catch (err) {
                    if (err.code !== 'ENOENT') {
                        console.error(`Error checking thumbnail for ${filename}:`, err);
                    }
                    console.warn(`No thumbnail found for ${filename}, using original image.`);
                }
            }

            let thumbnailDimensions = dimensions;
            if (thumbnailFound) {
                try {
                    // Get dimensions of the thumbnail
                    thumbnailDimensions = await sizeOfAsync(thumbnailFullName);
                } catch (err) {
                    console.error(`Failed to get dimensions for thumbnail ${thumbnailFullName}:`, err);
                    // Fallback to original dimensions if thumbnail dimensions can't be read
                }
            }

            return {
                src: path.join('photos', filename),
                thumbnail: thumbnailFound ? path.join('photos', 'thumbs', filename) : path.join('photos', filename),
                width: dimensions.width,
                height: dimensions.height,
                thumbnailWidth: thumbnailDimensions.width,
                thumbnailHeight: thumbnailDimensions.height,
            };
        }));

        // Filter out any null entries resulting from errors
        const validPhotos = photos.filter(photo => photo !== null);

        console.log(`Processed ${validPhotos.length} photos.`);
        return validPhotos;
    } catch (err) {
        console.error('Error processing photos:', err);
        throw err; // Re-throw the error after logging
    }
}

let photos = [];
const photoPromise = processPhotosAsync()
    .then(result => photos = result)
    .catch(err => {
        photos = [];
        // Handle the error as needed, e.g., notify the user or retry
    });

export async function getPhotos() {
    await photoPromise;
    return photos;
}
