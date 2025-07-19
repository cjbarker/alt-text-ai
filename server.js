const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');
const { ChatOllama } = require('@langchain/ollama');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images are allowed.'));
        }
    }
});

// Initialize Ollama with LangChain
const initializeOllama = () => {
    try {
        return new ChatOllama({
            baseUrl: 'http://localhost:11434',
            model: 'llava:latest', // Vision-capable model
            temperature: 0.3,
        });
    } catch (error) {
        console.error('Error initializing Ollama:', error);
        throw error;
    }
};


// Optimize image for LLM processing
const optimizeImage = async (buffer) => {
    try {
        return await sharp(buffer)
            .resize(512, 512, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
    } catch (error) {
        console.error('Error optimizing image:', error);
        return buffer;
    }
};

// Generate alt text using Ollama
const generateAltText = async (imageBuffer, filename) => {
    try {
        const ollama = initializeOllama();

        // Optimize image
        const optimizedBuffer = await optimizeImage(imageBuffer);
        const base64Image = optimizedBuffer.toString('base64');

        // Create prompt for alt text generation
        const prompt = `Describe what's in this picture and then reduce the description to the W3C specification text string length for an HTML image alt tags attribute. Description should include the subject, environment, settings, and the overall mood of the image. Respond only with the HTML image alt tag text. Length of text should be 150 characters or less`;

        // Send image to Ollama for analysis
        const response = await ollama.invoke([
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: prompt,
                    },
                    {
                        type: 'image_url',
                        image_url: {
                            url: `data:image/jpeg;base64,${base64Image}`,
                        },
                    },
                ],
            },
        ]);

        return response.content.trim();
    } catch (error) {
        console.error('Error generating alt text with Ollama:', error);
        throw error;
    }
};

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Alt Text Generator API is running' });
});

// Check Ollama connection
app.get('/api/ollama/status', async (req, res) => {
    try {
        const ollama = initializeOllama();
        await ollama.invoke([{ role: 'user', content: 'Hello' }]);
        res.json({ status: 'connected', message: 'Ollama is accessible' });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Cannot connect to Ollama',
            error: error.message
        });
    }
});

// Generate alt text for uploaded images
app.post('/api/generate-alt-text', upload.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const results = [];

        for (const file of req.files) {
            try {
                // Generate alt text using Ollama
                const altText = await generateAltText(file.buffer, file.originalname);

                results.push({
                    filename: file.originalname,
                    altText: altText,
                    size: file.size,
                    mimeType: file.mimetype
                });
            } catch (error) {
                console.error(`Error processing ${file.originalname}:`, error);
                results.push({
                    filename: file.originalname,
                    error: `Failed to process image: ${error.message}`
                });
            }
        }

        res.json({ results });
    } catch (error) {
        console.error('Error in generate-alt-text endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
    }

    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Alt Text Generator server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Ollama status: http://localhost:${PORT}/api/ollama/status`);
    console.log('\n📋 Prerequisites:');
    console.log('1. Ollama must be running on localhost:11434');
    console.log('2. Install a vision model: ollama pull llava:latest');
    console.log('3. Ensure the model is downloaded and ready');
});
