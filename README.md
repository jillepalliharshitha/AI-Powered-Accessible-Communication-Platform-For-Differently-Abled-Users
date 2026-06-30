
# Sign Language Translation Application

A smart platform that enables differently abled individuals to communicate effortlessly with others in real-time, making conversations more inclusive and accessible.

## **Features**

- **Real-time Sign Language Detection**: Uses computer vision to detect hand gestures
- **Multi-language Translation**: Support for 9 languages (Spanish, French, German, Chinese, Japanese, Korean, Hindi, Telugu, Tamil)
- **Speech-to-Text**: Voice input functionality with multi-language support
- **Text-to-Speech**: Audio output in selected languages
- **Spell Checking**: Intelligent spell checking with contextual suggestions
- **Real-time Chat**: Integrated chat system with translation capabilities
- **Responsive Design**: Works on desktop and mobile devices

## **Project Structure**

```
sign-language/
|
|-- backend/                 # Python Flask backend
|   |-- server.py            # Main Flask server
|   |-- start_server.py      # Server starter script
|   |-- requirements.txt     # Python dependencies
|   |-- cnn8grps_rad1_model.h5  # ML model
|   `-- venv/                # Virtual environment
|
|-- frontend/                # React frontend
|   |-- src/                 # React source code
|   |   |-- components/      # React components
|   |   |-- pages/           # Page components
|   |   |-- services/        # API services
|   |   |-- utils/           # Utility functions
|   |   `-- App.js           # Main application
|   |-- public/              # Static assets
|   |-- package.json         # Node.js dependencies
|   `-- node_modules/        # Installed packages
|
`-- README.md                # This file
```

## **Prerequisites**

### **System Requirements**
- **Node.js** (version 16 or higher)
- **Python** (version 3.8 or higher)
- **pip** (Python package manager)
- **Web browser** with camera support
- **Microphone** (for voice input)

### **Python Dependencies**
- Flask
- OpenCV
- TensorFlow/Keras
- MediaPipe
- NumPy

### **Node.js Dependencies**
- React
- React Router
- Tailwind CSS
- Axios

## **Installation & Setup**

### **1. Clone the Repository**
```bash
git clone https://github.com/Vigneshbabu4/FINALPROJECT.git
cd sign-language
```

### **2. Backend Setup**

#### **2.1 Create Virtual Environment**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### **2.2 Install Python Dependencies**
```bash
pip install -r requirements.txt
```

#### **2.3 Verify ML Model**
Ensure `cnn8grps_rad1_model.h5` is in the backend folder (13.5MB file)

### **3. Frontend Setup**

#### **3.1 Install Node.js Dependencies**
```bash
cd frontend
npm install
```

#### **3.2 Verify Installation**
Check that `node_modules` folder is created and `package.json` dependencies are installed

## **Running the Application**

### **Method 1: Manual Startup (Recommended)**

#### **Step 1: Start Backend Server**
```bash
# Terminal 1
cd backend
python server.py
```
**Expected Output:**
```
 * Running on http://127.0.0.1:5000
 * Debug mode: off
Model loaded successfully
Enchant spell checker initialized
```

#### **Step 2: Start Frontend**
```bash
# Terminal 2
cd frontend
npm start
```
**Expected Output:**
```
Compiled successfully!
You can now view sign-language in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

#### **Step 3: Open Application**
- Open your browser and go to `http://localhost:3000`
- Click "Start camera" to begin sign language detection

### **Method 2: Using Starter Scripts**

#### **Start Backend**
```bash
cd backend
python start_server.py
```

#### **Start Frontend**
```bash
cd frontend
npm start
```

## **Application Usage**

### **1. Camera Page (Main Functionality)**
1. **Click "Start camera"** to activate camera
2. **Make hand gestures** for sign language detection
3. **View detected text** in real-time
4. **Use "Send to Chat"** to send detected text to chat
5. **Enable auto-read** for audio feedback

### **2. Chat Features**
- **Type messages** in the input field
- **Use microphone** for voice input
- **Click messages** to translate to other languages
- **Select target language** from dropdown menu
- **Toggle auto-read** for automatic speech

### **3. Language Support**
- **Spanish** (es-ES)
- **French** (fr-FR)
- **German** (de-DE)
- **Chinese** (zh-CN)
- **Japanese** (ja-JP)
- **Korean** (ko-KR)
- **Hindi** (hi-IN)
- **Telugu** (te-IN)
- **Tamil** (ta-IN)

### **4. Spell Checking**
- **Toggle spell check** button in detector
- **View suggestions** for misspelled words
- **Click suggestions** to apply corrections
- **Contextual suggestions** based on sentence context

## **Troubleshooting**

### **Common Issues**

#### **1. Backend Not Starting**
```bash
# Check Python version
python --version

# Check virtual environment
which python

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

#### **2. Frontend Not Starting**
```bash
# Check Node.js version
node --version
npm --version

# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### **3. Camera Not Working**
- **Check browser permissions**: Allow camera access
- **Try different browser**: Chrome, Firefox, Edge
- **Check camera hardware**: Ensure camera is connected
- **Restart browser**: Close and reopen browser

#### **4. Hand Detection Not Working**
- **Check lighting**: Ensure good lighting conditions
- **Hand position**: Keep hand in camera frame
- **Background**: Use plain background if possible
- **Distance**: Maintain appropriate distance from camera

#### **5. Backend Connection Issues**
- **Check port 5000**: Ensure not blocked by firewall
- **Check server logs**: Look for error messages
- **Restart backend**: Stop and restart Python server
- **Check model file**: Ensure ML model is present

### **Error Messages**

#### **"Backend Offline"**
- Backend server not running
- Solution: Start Python server in backend folder

#### **"No Hand Detected"**
- Camera not seeing hand
- Solution: Adjust lighting and hand position

#### **"Model loading failed"**
- ML model file missing or corrupted
- Solution: Ensure `cnn8grps_rad1_model.h5` exists

#### **"Speech recognition not supported"**
- Browser doesn't support speech recognition
- Solution: Use Chrome or Edge browser

## **Development**

### **Frontend Development**
```bash
cd frontend
npm start
```

### **Backend Development**
```bash
cd backend
python server.py
```

### **Code Structure**
- **Frontend**: React components with Tailwind CSS
- **Backend**: Flask with TensorFlow for ML
- **API**: RESTful endpoints for communication
- **ML Model**: CNN for sign language recognition

## **API Endpoints**

### **Backend Endpoints**
- `GET /api/health` - Health check
- `POST /api/detect-sign` - Sign language detection
- `POST /api/clear-text` - Clear accumulated text
- `GET /api/test-model` - Test ML model

### **Frontend Routes**
- `/` - Home/Landing page
- `/login` - Login page
- `/camera` - Main camera page

## **Performance Optimization**

### **Frontend**
- **Lazy loading** for components
- **Debouncing** for API calls
- **Caching** for translations
- **Optimized rendering** with React hooks

### **Backend**
- **Model pre-loading** for faster startup
- **Frame rate limiting** (30 FPS)
- **Error handling** and recovery
- **Connection pooling**

## **Security**

### **Frontend**
- **HTTPS** for production
- **Input validation** and sanitization
- **CORS** configuration
- **Secure API calls**

### **Backend**
- **Input validation** and sanitization
- **Error handling** without information leakage
- **Rate limiting** for API endpoints
- **Secure model serving**

## **Deployment**

### **Frontend Deployment**
```bash
cd frontend
npm run build
# Deploy build/ folder to hosting service
```

### **Backend Deployment**
```bash
cd backend
pip install gunicorn
gunicorn --workers 4 --bind 0.0.0.0:5000 server:app
```

### **Environment Variables**
```bash
# Backend
FLASK_ENV=production
PORT=5000

# Frontend
REACT_APP_API_URL=http://localhost:5000/api
```

## **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## **Support**

For issues and questions:
1. Check the troubleshooting section
2. Review error logs
3. Create an issue on GitHub
4. Contact the development team

## **Version History**

- **v1.0.0** - Initial release with basic sign language detection
- **v1.1.0** - Added multi-language translation
- **v1.2.0** - Enhanced spell checking and UI improvements
- **v1.3.0** - Optimized performance and bug fixes

---

**Happy Coding!** Sign Language Translation Application - Making Communication Accessible for Everyone!

