import { defineConfig, ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import fs from 'fs';

const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server: ViteDevServer) {
        server.middlewares.use('/user-data', (req, res, next) => {
            const filePath = path.join(__dirname, 'user-data', req.url || '');

            // Security check: Ensure the path is within 'user-data'
            if (!filePath.startsWith(path.join(__dirname, 'user-data'))) {
                res.statusCode = 403;
                res.end('Forbidden');
                return;
            }

            fs.stat(filePath, (err, stats) => {
                if (err || !stats.isFile()) {
                    next();
                    return;
                }

                // Determine the content type
                let contentType = 'application/octet-stream';
                if (filePath.endsWith('.json')) {
                    contentType = 'application/json';
                } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
                    contentType = 'image/jpeg';
                } else if (filePath.endsWith('.png')) {
                    contentType = 'image/png';
                }

                res.setHeader('Content-Type', contentType);
                fs.createReadStream(filePath).pipe(res);
            });
        });
    },
})

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tsconfigPaths(), myPlugin()],
    build: {
        outDir: 'build',
        chunkSizeWarningLimit: 600,
    },
    server: {
        fs: {
            // Allow serving files from the 'user-data' directory
            allow: ['..'],
        },
        open: true,
        port: 3000,
        proxy: {
            '/api': 'http://localhost:5000',
            '/photos': 'http://localhost:5000',
            '/private': 'http://localhost:5000',
        }
    }
});
