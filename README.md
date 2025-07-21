# AI-Powered Alt Text Generator

An intelligent web application that generates descriptive alt text for images using LangChain and Ollama with vision-capable LLMs.

## Features

- 🎨 **Modern UI** - Clean, responsive design 
- 🖼️ **Drag & Drop** - Easy image upload with preview functionality  
- 🤖 **AI-Powered** - Uses Ollama with LLaVA vision model via LangChain
- 🔐 **Secure** - File validation and type checking
- ⚡ **Fast Processing** - Optimized image handling and batch processing
- ♿ **Accessibility First** - Generates W3C compliant alt text

## Prerequisites

Before running the application, ensure you have:

1. **Node.js** (v16 or higher)
2. **Ollama** installed and running
3. **LLaVA vision model** downloaded


## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd alt-text
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Setup Ollama (Required)
```bash
# Install Ollama (if not already installed)
# macOS:
brew install ollama

# Or download from https://ollama.ai

# Download the LLaVA vision model
ollama pull llava:latest

# Start Ollama server (keep this running)
ollama serve
```

### 4. Start the Application
```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

### 5. Open in Browser
Navigate to: **http://localhost:3000**

## Testing

### Manual Testing
1. **Health Check**: Visit http://localhost:3000/api/health
2. **Ollama Status**: Visit http://localhost:3000/api/ollama/status
3. **Upload Test**: Try uploading an image through the web interface

### API Testing with curl
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test Ollama connection
curl http://localhost:3000/api/ollama/status

# Test image upload (replace with actual image file)
curl -X POST -F "images=@test-image.jpg" http://localhost:3000/api/generate-alt-text
```

### Troubleshooting Tests
If tests fail, check:
- Ollama is running: `ollama serve`
- LLaVA model is installed: `ollama list`
- Node.js server is running on port 3000
- No firewall blocking localhost:3000 or localhost:11434

## Usage

1. **Upload Images**: Drag and drop images or click to browse
2. **Generate Alt Text**: Click the "Generate Alt Text" button  
3. **AI Processing**: Images are sent to Ollama's LLaVA model via LangChain
4. **Review Results**: View AI-generated alt text (≤150 chars)

### What the AI Analyzes
The LLaVA vision model examines:
- **Main subjects** and objects in the image
- **Environmental context** and setting details
- **Visual mood** and atmosphere
- **Spatial relationships** between elements
- **Colors, lighting,** and composition

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/ollama/status` - Check Ollama connection
- `POST /api/generate-alt-text` - Generate alt text for uploaded images

## Technical Architecture

### Frontend
- **HTML5** with semantic structure
- **CSS3** with responsive design and animations
- **Vanilla JavaScript** with modern ES6+ features
- **File API** for drag-and-drop functionality

### Backend
- **Express.js** server with CORS support
- **Multer** for file upload handling
- **LangChain** for LLM integration
- **Ollama** for local AI inference
- **Sharp** for image optimization

### AI Integration
- **LLaVA Model** - Vision-language model for image analysis
- **LangChain** - Framework for LLM application development
- **Ollama** - Local LLM server for privacy and performance

## File Structure

```
alt-text/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # Frontend JavaScript
├── server.js           # Express backend server
├── package.json        # Node.js dependencies
├── .gitignore          # Git ignore file
└── README.md          # This file
```

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `OLLAMA_BASE_URL` - Ollama server URL (default: http://localhost:11434)

### Ollama Model Settings
The server uses these default settings for the LLaVA model:
- **Temperature**: 0.3 (for consistent results)
- **Model**: llava:latest
- **Max Image Size**: 512x512 (optimized for performance)

### AI Prompt Configuration
The LLM uses this prompt for generating alt text (located in `server.js:77`):

```
Describe what's in this picture and then reduce the description to the W3C specification text string length for an HTML image alt tags attribute. Description should include the subject, environment, settings, and the overall mood of the image. Respond only with the HTML image alt tag text. Length of text should be 150 characters or less
```

This prompt ensures:
- **W3C Compliance** - Follows HTML alt attribute standards
- **Concise Output** - Limited to 150 characters as per best practices
- **Comprehensive Analysis** - Includes subject, environment, setting, and mood
- **Clean Response** - Returns only the alt text without extra formatting

## Troubleshooting

### Common Issues

1. **"Cannot connect to Ollama"**
   - Ensure Ollama is running: `ollama serve`
   - Check if LLaVA model is installed: `ollama list`

2. **"File too large" errors**
   - Images are limited to 10MB
   - Images are automatically resized to 512x512 for optimal processing

3. **Slow processing**
   - First-time model loading can be slow
   - Consider using a smaller model like `llava:7b` for faster inference

### Health Checks

Visit these endpoints to verify everything is working:
- http://localhost:3000/api/health - Server status
- http://localhost:3000/api/ollama/status - Ollama connection

## Performance Optimization

- Images are automatically optimized to 512x512 resolution
- JPEG compression at 80% quality for LLM processing
- Batch processing for multiple images
- Efficient memory management with stream processing

## Security Features

- File type validation (images only)
- File size limits (10MB max)
- No persistent file storage on server
- Input sanitization and error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- **Ollama Team** - For the excellent local LLM server
- **LangChain** - For the powerful LLM framework  
- **LLaVA** - For the vision-language model
- **AltText.ai** - For design inspiration
