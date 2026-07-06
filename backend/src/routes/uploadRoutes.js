const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const router = express.Router();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

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
