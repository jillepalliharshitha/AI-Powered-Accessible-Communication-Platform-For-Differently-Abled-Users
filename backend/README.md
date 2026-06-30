# Sign Language Detection Backend

This backend server provides the AI-powered sign language detection functionality for the React application.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- pip package manager
- The trained model file `cnn8grps_rad1_model.h5` should be in the parent directory

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install required packages:**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Server

1. **Make sure the model file is in the correct location:**
   - The model `cnn8grps_rad1_model.h5` should be in the parent directory (`../cnn8grps_rad1_model.h5`)

2. **Start the server:**
   ```bash
   python server.py
   ```

3. **The server will start on:** `http://localhost:5000`

### API Endpoints

#### POST `/api/detect-sign`
Detects sign language from an image.

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

**Response:**
```json
{
  "success": true,
  "character": "A",
  "confidence": 0.85
}
```

#### GET `/api/health`
Checks if the server is running and model is loaded.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### Integration with React App

The React app will automatically connect to this backend when:
1. The backend server is running on `http://localhost:5000`
2. The `REACT_APP_API_URL` environment variable is set (optional)
3. The camera detection is started in the React app

### Troubleshooting

#### Common Issues:

1. **Model not found:**
   - Ensure `cnn8grps_rad1_model.h5` is in the parent directory
   - Check the file path in `server.py`

2. **Port already in use:**
   - Change the port in `server.py` (line 200): `app.run(debug=True, port=5001)`
   - Update the React app to use the new port

3. **CORS issues:**
   - The backend includes CORS support
   - If issues persist, check browser console for specific errors

4. **Camera permissions:**
   - Ensure browser has camera permissions
   - Check browser settings for camera access

5. **Dependencies not found:**
   - Run `pip install -r requirements.txt` again
   - Check Python version compatibility

### Model Information

The backend uses a trained CNN model that:
- Classifies hand gestures into 8 main groups
- Further classifies into specific letters A-Z
- Uses hand landmark detection for preprocessing
- Supports space and backspace gestures

### Development

To modify the detection logic:
1. Edit the `_classify_gesture` method in `SignLanguagePredictor` class
2. Add new gesture recognition rules as needed
3. Restart the server to apply changes

### Performance Tips

- The server processes frames every 500ms by default
- Adjust the interval in the React service for different performance
- GPU acceleration can be added to TensorFlow for better performance
