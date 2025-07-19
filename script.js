class AltTextGenerator {
    constructor() {
        this.uploadedFiles = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const generateBtn = document.getElementById('generateBtn');

        // Click to browse files
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Generate button click
        generateBtn.addEventListener('click', () => {
            this.generateAltText();
        });
    }

    handleFiles(files) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        Array.from(files).forEach(file => {
            if (validTypes.includes(file.type)) {
                // Check if file already exists
                const exists = this.uploadedFiles.some(f => 
                    f.name === file.name && f.size === file.size
                );
                
                if (!exists) {
                    this.uploadedFiles.push(file);
                    this.displayImagePreview(file);
                }
            } else {
                alert(`File "${file.name}" is not a supported image format.`);
            }
        });

        this.updateGenerateButton();
    }

    displayImagePreview(file) {
        const preview = document.getElementById('imagePreview');
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.dataset.fileName = file.name;

        const img = document.createElement('img');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => this.removeImage(file.name);

        const imageInfo = document.createElement('div');
        imageInfo.className = 'image-info';
        imageInfo.innerHTML = `
            <div><strong>${file.name}</strong></div>
            <div>Size: ${this.formatFileSize(file.size)}</div>
        `;

        const altTextDiv = document.createElement('div');
        altTextDiv.className = 'alt-text';
        altTextDiv.innerHTML = '<em>Alt text will appear here...</em>';

        imageItem.appendChild(img);
        imageItem.appendChild(removeBtn);
        imageItem.appendChild(imageInfo);
        imageItem.appendChild(altTextDiv);

        preview.appendChild(imageItem);
    }

    removeImage(fileName) {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== fileName);
        
        const imageItem = document.querySelector(`[data-file-name="${fileName}"]`);
        if (imageItem) {
            imageItem.remove();
        }

        this.updateGenerateButton();
    }

    updateGenerateButton() {
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = this.uploadedFiles.length === 0;
        generateBtn.textContent = this.uploadedFiles.length === 0 
            ? 'Generate Alt Text' 
            : `Generate Alt Text (${this.uploadedFiles.length} image${this.uploadedFiles.length > 1 ? 's' : ''})`;
    }

    async generateAltText() {
        const generateBtn = document.getElementById('generateBtn');
        
        generateBtn.disabled = true;
        generateBtn.classList.add('processing');
        generateBtn.textContent = 'Processing with AI...';

        try {
            // Create FormData to send files to backend
            const formData = new FormData();
            this.uploadedFiles.forEach((file, index) => {
                formData.append('images', file);
            });

            // Update button to show API call in progress
            generateBtn.textContent = `Analyzing ${this.uploadedFiles.length} image${this.uploadedFiles.length > 1 ? 's' : ''} with Ollama...`;
            
            // Send images to backend API
            const response = await fetch('/api/generate-alt-text', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate alt text');
            }

            const data = await response.json();
            
            // Update each image with the results
            data.results.forEach(result => {
                if (result.error) {
                    this.updateImageAltText(result.filename, `Error: ${result.error}`);
                } else {
                    this.updateImageAltText(result.filename, result.altText);
                }
            });

        } catch (error) {
            console.error('Error generating alt text:', error);
            
            // Check if it's a network error
            if (error.message.includes('fetch')) {
                alert('Cannot connect to the server. Please make sure the Node.js server is running on port 3000.');
            } else {
                alert(`Error: ${error.message}`);
            }
            
            // Show error message if API fails
            for (const file of this.uploadedFiles) {
                this.updateImageAltText(file.name, 'API Error - Server not available');
            }
        } finally {
            generateBtn.disabled = false;
            generateBtn.classList.remove('processing');
            generateBtn.textContent = 'Generate Alt Text';
            this.updateGenerateButton();
        }
    }


    // This method is no longer used as we now call the backend API
    // Keeping it for backward compatibility in case of API failures
    async analyzeImage(file, checksum) {
        // Fallback placeholder function - only used if API is unavailable
        const placeholderDescriptions = [
            "A person standing in front of a building on a sunny day",
            "A close-up view of a colorful flower in a garden", 
            "A group of people gathered around a table with documents",
            "A scenic landscape with mountains and trees in the background",
            "A modern office space with computers and office furniture",
            "A delicious meal presented on a white plate",
            "A city street with cars and pedestrians during daytime",
            "A cozy living room with comfortable seating and warm lighting",
            "A professional headshot of a person smiling at the camera",
            "An artistic composition featuring geometric shapes and colors"
        ];
        
        const index = parseInt(checksum.substring(0, 2), 16) % placeholderDescriptions.length;
        return placeholderDescriptions[index];
    }

    updateImageAltText(fileName, altText) {
        const imageItem = document.querySelector(`[data-file-name="${fileName}"]`);
        if (imageItem) {
            const altTextDiv = imageItem.querySelector('.alt-text');
            altTextDiv.innerHTML = `
                <strong>Alt Text:</strong><br>
                ${altText}
            `;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AltTextGenerator();
});