import express from 'express';
import path from 'path';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const upload = multer({ dest: 'uploads/' });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // API Route for conversion
  app.post('/api/convert', upload.single('video'), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: 'No video file provided' });
      return;
    }

    const inputPath = req.file.path;

    // Use a custom filename if provided, else generic
    const targetFilename = req.body.outputName 
      ? `${req.body.outputName.replace(/[^a-zA-Z0-9_-]/g, '_')}.mp3` 
      : 'converted.mp3';

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${targetFilename}"`);

    // Stream the converted MP3 directly to the response
    ffmpeg(inputPath)
      .noVideo()
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('end', () => {
        // Clean up input file after successful conversion stream
        fs.unlink(inputPath, () => {});
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        if (!res.headersSent) {
          res.status(500).end('Conversion failed');
        }
        // Clean up on error
        fs.unlink(inputPath, () => {});
      })
      .pipe(res, { end: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
