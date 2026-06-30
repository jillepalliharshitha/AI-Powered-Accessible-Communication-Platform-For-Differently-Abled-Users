class SignLanguageService {
  constructor() {
    this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.isDetecting = false;
    this.detectionInterval = null;
    this.onDetectionCallback = null;
  }

  // Start real-time sign detection
  startDetection(videoElement, callback) {
    if (!videoElement) {
      throw new Error('Video element is required');
    }

    this.isDetecting = true;
    this.onDetectionCallback = callback;

    // Capture frames every 300ms instead of 500ms for continuous processing like Tkinter
    this.detectionInterval = setInterval(() => {
      if (this.isDetecting && videoElement) {
        this.captureAndDetect(videoElement);
      }
    }, 300);
  }

  // Stop sign detection
  stopDetection() {
    this.isDetecting = false;
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
    this.onDetectionCallback = null;
  }

  // Capture frame from video and send to backend
  captureAndDetect(videoElement) {
    try {
      console.log('📸 Capturing frame from video element...');
      
      // Create canvas to capture video frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      
      console.log(`📐 Canvas dimensions: ${canvas.width}x${canvas.height}`);
      
      // Draw video frame to canvas
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Convert to base64 with higher quality (0.95 instead of 0.8) for better detection
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      console.log('🖼️ Image data length:', imageData.length);
      
      // Send to backend for detection
      this.detectSign(imageData);
    } catch (error) {
      console.error('❌ Error capturing frame:', error);
    }
  }

  // Send image to backend for sign detection
  async detectSign(imageData) {
    try {
      console.log('🔍 Sending image to backend for detection...');
      
      const response = await fetch(`${this.apiUrl}/api/detect-sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData
        })
      });

      const result = await response.json();
      console.log('📥 Backend response:', result);

      if (result.success && this.onDetectionCallback) {
        console.log('✅ Detection successful:', result);
        this.onDetectionCallback({
          character: result.character,
          accumulated_text: result.accumulated_text || '',
          confidence: result.confidence,
          hand_detected: result.hand_detected || true,
          skeleton_image: result.skeleton_image || null,
          timestamp: Date.now()
        });
      } else {
        console.log('❌ Detection failed:', result);
        if (this.onDetectionCallback) {
          this.onDetectionCallback({
            hand_detected: result.hand_detected || false,
            skeleton_image: null
          });
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Error detecting sign:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if backend server is healthy
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/api/health`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy', error: error.message };
    }
  }

  // Clear accumulated text on backend
  async clearText() {
    try {
      const response = await fetch(`${this.apiUrl}/api/clear-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error clearing text:', error);
      return { success: false, error: error.message };
    }
  }

  // Get detection status
  isDetectionActive() {
    return this.isDetecting;
  }
}

const signLanguageService = new SignLanguageService();

export default signLanguageService;
