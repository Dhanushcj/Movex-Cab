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

// Multer storage for memory (to upload to S3)
const upload = multer({ storage: multer.memoryStorage() });

// Helper to upload to S3
const uploadToS3 = async (file, folder) => {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    if (!bucket) throw new Error('AWS_S3_BUCKET_NAME is not configured');
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanOriginal = (file.originalname || 'upload').replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${folder}/${uniqueSuffix}-${cleanOriginal}`;

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3Client.send(command);
    
    const region = process.env.AWS_REGION || 'ap-south-1';
    return `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;
};

// Direct upload route for banners and other images to S3
router.post('/image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const folder = req.body.folder || 'banners';
        const url = await uploadToS3(req.file, folder);

        res.json({ success: true, imageUrl: url });
    } catch (error) {
        console.error('Error uploading image to S3:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Direct upload route for documents to S3
router.post('/document', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No document file uploaded' });
        }

        const url = await uploadToS3(req.file, 'documents');

        res.json({ success: true, fileUrl: url });
    } catch (error) {
        console.error('Error uploading document to S3:', error);
        res.status(500).json({ error: 'Failed to upload document' });
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
