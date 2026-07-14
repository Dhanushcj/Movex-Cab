const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
    },
});

const admin = require('../config/firebase');

// Multer storage for memory (to upload to Firebase)
const upload = multer({ storage: multer.memoryStorage() });

// Direct upload route for banners and other images to Firebase Storage
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const bucket = admin.storage().bucket();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(req.file.originalname) || '';
        const filename = `banners/${uniqueSuffix}${ext}`;
        const file = bucket.file(filename);

        await file.save(req.file.buffer, {
            metadata: {
                contentType: req.file.mimetype,
            }
        });

        // Generate a public URL that doesn't expire for ~100 years
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '01-01-2100'
        });

        res.json({ success: true, imageUrl: url });
    } catch (error) {
        console.error('Error uploading image to Firebase:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// S3 Presigned URL route (kept for legacy support)
router.post('/upload-url', async (req, res) => {
    try {
        const { filename, fileType } = req.body;

        if (!filename || !fileType) {
            return res.status(400).json({ error: 'Filename and fileType are required' });
        }

        // Generate a unique file key
        const timestamp = Date.now();
        // Remove spaces and special characters from filename, keep it alphanumeric + dots
        const cleanFilename = filename.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileKey = `documents/${timestamp}-${cleanFilename}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileKey,
            ContentType: fileType,
        });

        // Generate pre-signed URL (expires in 1 hour)
        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        res.json({
            uploadUrl,
            fileKey,
            urlExpiresIn: 3600
        });
    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});

module.exports = router;
