from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import os
import sys
import logging
import traceback
from cvzone.HandTrackingModule import HandDetector
import tensorflow as tf
from tensorflow.keras.models import load_model
import math

# Configure TensorFlow to suppress warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
tf.get_logger().setLevel('ERROR')

# Add parent directory to path to import the prediction logic
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize hand detector with improved sensitivity
# detectionCon: confidence threshold for detection (lower = more sensitive, 0.3 is more tolerant than default 0.5)
hd = HandDetector(maxHands=1, detectionCon=0.3)
hd2 = HandDetector(maxHands=1, detectionCon=0.3)

# Track detector errors for recovery
detector_error_count = 0
MAX_DETECTOR_ERRORS = 5

def reinitialize_detector():
    """Reinitialize the HandDetector to fix timestamp errors"""
    global hd, hd2, detector_error_count
    logger.info("🔄 Reinitializing HandDetector due to timestamp errors...")
    hd = HandDetector(maxHands=1, detectionCon=0.3)
    hd2 = HandDetector(maxHands=1, detectionCon=0.3)
    detector_error_count = 0

# Load the trained model
model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'cnn8grps_rad1_model.h5')
try:
    model = load_model(model_path)
    logger.info("Model loaded successfully")
    
    # Print model summary for debugging
    logger.info(f"📋 Model input shape: {model.input_shape}")
    logger.info(f"📋 Model output shape: {model.output_shape}")
    
    # Try to get model summary
    try:
        model_summary = []
        model.summary(print_fn=lambda x: model_summary.append(str(x)))
        logger.info("📋 Model summary:")
        for line in model_summary[:10]:  # First 10 lines
            logger.info(f"   {line}")
    except:
        logger.info("Could not get model summary")
        
except Exception as e:
    logger.error(f"Error loading model: {e}")
    logger.error(f"Model path: {model_path}")
    model = None

offset = 29

class SignLanguagePredictor:
    def __init__(self, model):
        self.model = model
        self.prev_char = ""
        self.count = -1
        self.ten_prev_char = [" "] * 10
        self.str = " "
    
    @staticmethod
    def distance(p1, p2):
        """Calculate Euclidean distance between two points"""
        return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)  # Accumulated text
        
    def distance(self, x, y):
        return math.sqrt(((x[0] - y[0]) ** 2) + ((x[1] - y[1]) ** 2))
    
    def process_gesture(self, predicted_char):
        """Process gesture with text accumulation logic from final_pred.py"""
        if predicted_char == "next" and self.prev_char != "next":
            if self.ten_prev_char[(self.count-2)%10] != "next":
                if self.ten_prev_char[(self.count-2)%10] == "Backspace":
                    self.str = self.str[0:-1]
                else:
                    if self.ten_prev_char[(self.count - 2) % 10] != "Backspace":
                        self.str = self.str + self.ten_prev_char[(self.count-2)%10]
            else:
                if self.ten_prev_char[(self.count - 0) % 10] != "Backspace":
                    self.str = self.str + self.ten_prev_char[(self.count - 0) % 10]

        if predicted_char == " " and self.prev_char != " ":
            self.str = self.str + " "

        self.prev_char = predicted_char
        self.count += 1
        self.ten_prev_char[self.count%10] = predicted_char
        
        return predicted_char, self.str
    
    def predict_gesture(self, hand_landmarks):
        """Predict gesture using model and hand landmarks"""
        try:
            if not self.model:
                logger.error("Model not loaded")
                return None

            logger.info(f"🤖 Starting prediction with {len(hand_landmarks)} landmarks")

            # Create white background for hand skeleton
            white = np.ones((400, 400, 3), dtype=np.uint8) * 255

            # Draw hand skeleton on white background
            pts = hand_landmarks
            os_val = ((400 - 200) // 2) - 15
            os1 = ((400 - 200) // 2) - 15

            logger.info(f"🎨 Drawing hand skeleton with offset: {os_val}, {os1}")

            # Draw fingers connections
            for t in range(0, 4, 1):
                cv2.line(white, (pts[t][0] + os_val, pts[t][1] + os1),
                            (pts[t + 1][0] + os_val, pts[t + 1][1] + os1), (0, 255, 0), 3)
            for t in range(5, 8, 1):
                cv2.line(white, (pts[t][0] + os_val, pts[t][1] + os1),
                            (pts[t + 1][0] + os_val, pts[t + 1][1] + os1), (0, 255, 0), 3)
            for t in range(9, 12, 1):
                cv2.line(white, (pts[t][0] + os_val, pts[t][1] + os1),
                            (pts[t + 1][0] + os_val, pts[t + 1][1] + os1), (0, 255, 0), 3)
            for t in range(13, 16, 1):
                cv2.line(white, (pts[t][0] + os_val, pts[t][1] + os1),
                            (pts[t + 1][0] + os_val, pts[t + 1][1] + os1), (0, 255, 0), 3)
            for t in range(17, 20, 1):
                cv2.line(white, (pts[t][0] + os_val, pts[t][1] + os1),
                            (pts[t + 1][0] + os_val, pts[t + 1][1] + os1), (0, 255, 0), 3)

            # Draw palm connections
            cv2.line(white, (pts[5][0] + os_val, pts[5][1] + os1),
                    (pts[9][0] + os_val, pts[9][1] + os1), (0, 255, 0), 3)
            cv2.line(white, (pts[9][0] + os_val, pts[9][1] + os1),
                    (pts[13][0] + os_val, pts[13][1] + os1), (0, 255, 0), 3)
            cv2.line(white, (pts[13][0] + os_val, pts[13][1] + os1),
                    (pts[17][0] + os_val, pts[17][1] + os1), (0, 255, 0), 3)
            cv2.line(white, (pts[0][0] + os_val, pts[0][1] + os1),
                    (pts[5][0] + os_val, pts[5][1] + os1), (0, 255, 0), 3)
            cv2.line(white, (pts[0][0] + os_val, pts[0][1] + os1),
                    (pts[17][0] + os_val, pts[17][1] + os1), (0, 255, 0), 3)

            # Draw landmark points
            for i in range(21):
                cv2.circle(white, (pts[i][0] + os_val, pts[i][1] + os1), 2, (0, 0, 255), 1)

            # Convert skeleton image to base64 for frontend display
            success, skeleton_encoded = cv2.imencode('.png', white)
            if success:
                skeleton_base64 = base64.b64encode(skeleton_encoded).decode('utf-8')
                self.skeleton_image = f"data:image/png;base64,{skeleton_base64}"
            else:
                self.skeleton_image = None

            logger.info("🖼️ Hand skeleton drawn and encoded for display")

            # Predict using model with error handling
            white_reshaped = white.reshape(1, 400, 400, 3)

            # Use model prediction with try-catch
            try:
                prob = np.array(self.model.predict(white_reshaped, verbose=0)[0], dtype='float32')
                logger.info(f"📊 Model prediction probabilities: {prob}")
            except Exception as e:
                logger.error(f"Model prediction error: {e}")
                return None

            ch1 = np.argmax(prob, axis=0)
            prob[ch1] = 0
            ch2 = np.argmax(prob, axis=0)
            prob[ch2] = 0
            ch3 = np.argmax(prob, axis=0)

            logger.info(f"🔢 Top predictions: ch1={ch1}, ch2={ch2}, ch3={ch3}")

            # Apply complete logic from final_pred.py for gesture classification
            predicted_char = self._classify_gesture(ch1, ch2, ch3, pts)

            logger.info(f"🔤 Classified gesture: {predicted_char}")

            # Process gesture with text accumulation
            processed_char, accumulated_text = self.process_gesture(predicted_char)

            logger.info(f"📝 Processed: char='{processed_char}', text='{accumulated_text}'")

            return {
                'character': processed_char,
                'accumulated_text': accumulated_text.strip(),
                'confidence': 0.85,  # Placeholder confidence
                'skeleton_image': self.skeleton_image  # Include skeleton visualization
            }

        except Exception as e:
            logger.error(f"Prediction error: {e}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    def _classify_gesture(self, ch1, ch2, ch3, pts):
        """Original working classification logic from final_pred.py"""
        
        pl = [ch1, ch2]
        
        # condition for [Aemnst]
        l = [[5, 2], [5, 3], [3, 5], [3, 6], [3, 0], [3, 2], [6, 4], [6, 1], [6, 2], [6, 6], [6, 7], [6, 0], [6, 5],
             [4, 1], [1, 0], [1, 1], [6, 3], [1, 6], [5, 6], [5, 1], [4, 5], [1, 4], [1, 5], [2, 0], [2, 6], [4, 6],
             [1, 0], [5, 7], [1, 6], [6, 1], [7, 6], [2, 5], [7, 1], [5, 4], [7, 0], [7, 5], [7, 2]]
        if pl in l:
            if (pts[6][1] < pts[8][1] and pts[10][1] < pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1]):
                ch1 = 0

        # condition for [o][s]
        l = [[2, 2], [2, 1]]
        if pl in l:
            if (pts[5][0] < pts[4][0]):
                ch1 = 0

        # condition for [c0][aemnst]
        l = [[0, 0], [0, 6], [0, 2], [0, 5], [0, 1], [0, 7], [5, 2], [7, 6], [7, 1]]
        pl = [ch1, ch2]
        if pl in l:
            if (pts[0][0] > pts[8][0] and pts[0][0] > pts[4][0] and pts[0][0] > pts[12][0] and pts[0][0] > pts[16][0] and pts[0][0] > pts[20][0]) and pts[5][0] > pts[4][0]:
                ch1 = 2

        # condition for [c0][aemnst]
        l = [[6, 0], [6, 6], [6, 2]]
        pl = [ch1, ch2]
        if pl in l:
            if self.distance(pts[8], pts[16]) < 52:
                ch1 = 2

        # condition for [gh][bdfikruvw]
        l = [[1, 4], [1, 5], [1, 6], [1, 3], [1, 0]]
        pl = [ch1, ch2]
        if pl in l:
            if pts[6][1] > pts[8][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1] and pts[0][0] < pts[8][0] and pts[0][0] < pts[12][0] and pts[0][0] < pts[16][0] and pts[0][0] < pts[20][0]:
                ch1 = 3

        # condition for [l][bdfikruvw]
        l = [[4, 4], [4, 5], [4, 6], [4, 1], [4, 0]]
        pl = [ch1, ch2]
        if pl in l:
            if pts[6][1] > pts[8][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1] and pts[0][0] < pts[8][0] and pts[0][0] < pts[12][0] and pts[0][0] < pts[16][0] and pts[0][0] < pts[20][0]:
                ch1 = 4

        # condition for [pqz][bdfikruvw]
        l = [[5, 4], [5, 5], [5, 1], [0, 3], [0, 7], [5, 0], [0, 2], [6, 2], [7, 5], [7, 1], [7, 6], [7, 7]]
        pl = [ch1, ch2]
        if pl in l:
            if (pts[6][1] < pts[8][1] and pts[10][1] < pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] > pts[20][1]):
                ch1 = 5

        # condition for [x][bdfikruvw]
        l = [[6, 4], [6, 1], [6, 2]]
        pl = [ch1, ch2]
        if pl in l:
            if pts[5][0] - pts[4][0] - 15 < 0:
                ch1 = 6

        # condition for [yj][bdfikruvw]
        l = [[1, 5], [1, 7], [1, 1], [1, 6], [1, 3], [1, 0]]
        pl = [ch1, ch2]
        if pl in l:
            if (pts[4][0] < pts[5][0] + 15) and ((pts[6][1] < pts[8][1] and pts[10][1] < pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] > pts[20][1])):
                ch1 = 7

        # condition for [uvr][bdfikruvw]
        l = [[5, 5], [5, 0], [5, 4], [5, 1], [4, 6], [4, 1], [7, 6], [3, 0], [3, 5]]
        pl = [ch1, ch2]
        if pl in l:
            if ((pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1])) and pts[4][1] > pts[14][1]:
                ch1 = 1

        # condition for [w][bdfikruvw]
        l = [[3, 5], [3, 0], [3, 6], [5, 1], [4, 1], [2, 0], [5, 0], [5, 5]]
        pl = [ch1, ch2]
        if pl in l:
            if not (pts[0][0] + 13 < pts[8][0] and pts[0][0] + 13 < pts[12][0] and pts[0][0] + 13 < pts[16][0] and pts[0][0] + 13 < pts[20][0]) and not (pts[0][0] > pts[8][0] and pts[0][0] > pts[12][0] and pts[0][0] > pts[16][0] and pts[0][0] > pts[20][0]) and self.distance(pts[4], pts[11]) < 50:
                ch1 = 1

        # condition for [w][bdfikruvw]
        l = [[5, 0], [5, 5], [0, 1]]
        pl = [ch1, ch2]
        if pl in l:
            if pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] > pts[16][1]:
                ch1 = 1

        # Map final group to letter
        class_groups = {
            0: ['A', 'E', 'M', 'N', 'S', 'T'],  # Group 0
            1: ['B', 'D', 'F', 'I', 'K', 'R', 'U', 'V', 'W'],  # Group 1
            2: ['C', 'O'],  # Group 2
            3: ['G', 'H'],  # Group 3
            4: ['L'],  # Group 4
            5: ['P', 'Q', 'Z'],  # Group 5
            6: ['X'],  # Group 6
            7: ['Y', 'J']   # Group 7
        }
        
        if ch1 in class_groups:
            letters = class_groups[ch1]
            predicted_char = letters[0]  # Default to first letter

        # -------------------------condn for subgroups  starts
        
        if ch1 == 0:
            ch1 = 'S'
            if pts[4][0] < pts[6][0] and pts[4][0] < pts[10][0] and pts[4][0] < pts[14][0] and pts[4][0] < pts[18][0]:
                ch1 = 'A'
            if pts[4][0] > pts[6][0] and pts[4][0] < pts[10][0] and pts[4][0] < pts[14][0] and pts[4][0] < pts[18][0] and pts[4][1] < pts[14][1] and pts[4][1] < pts[18][1]:
                ch1 = 'T'
            if pts[4][1] > pts[8][1] and pts[4][1] > pts[12][1] and pts[4][1] > pts[16][1] and pts[4][1] > pts[20][1]:
                ch1 = 'E'
            if pts[4][0] > pts[6][0] and pts[4][0] > pts[10][0] and pts[4][0] > pts[14][0] and pts[4][1] < pts[18][1]:
                ch1 = 'M'
            if pts[4][0] > pts[6][0] and pts[4][0] > pts[10][0] and pts[4][1] < pts[18][1] and pts[4][1] < pts[14][1]:
                ch1 = 'N'

        if ch1 == 2:
            if self.distance(pts[12], pts[4]) > 42:
                ch1 = 'C'
            else:
                ch1 = 'O'

        if ch1 == 3:
            if (self.distance(pts[8], pts[12])) > 72:
                ch1 = 'G'
            else:
                ch1 = 'H'

        if ch1 == 7:
            if self.distance(pts[8], pts[4]) > 42:
                ch1 = 'Y'
            else:
                ch1 = 'J'

        if ch1 == 4:
            ch1 = 'L'

        if ch1 == 6:
            ch1 = 'X'

        if ch1 == 5:
            if pts[4][0] > pts[12][0] and pts[4][0] > pts[16][0] and pts[4][0] > pts[20][0]:
                if pts[8][1] < pts[5][1]:
                    ch1 = 'Z'
                else:
                    ch1 = 'Q'
            else:
                ch1 = 'P'

        if ch1 == 1:
            if (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] > pts[16][1] and pts[18][1] > pts[20][1]):
                ch1 = 'B'
            if (pts[6][1] > pts[8][1] and pts[10][1] < pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1]):
                ch1 = 'D'
            if (pts[6][1] < pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] > pts[16][1] and pts[18][1] > pts[20][1]):
                ch1 = 'F'
            if (pts[6][1] < pts[8][1] and pts[10][1] < pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] > pts[20][1]):
                ch1 = 'I'
            if (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] > pts[16][1] and pts[18][1] < pts[20][1]):
                ch1 = 'W'
            if (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1]) and pts[4][1] < pts[9][1]:
                ch1 = 'K'
            if ((self.distance(pts[8], pts[12]) - self.distance(pts[6], pts[10])) < 8) and (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1]):
                ch1 = 'U'
            if ((self.distance(pts[8], pts[12]) - self.distance(pts[6], pts[10])) >= 8) and (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1]) and (pts[4][1] > pts[9][1]):
                ch1 = 'V'
            if (pts[8][0] > pts[12][0]) and (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] < pts[20][1]):
                ch1 = 'R'

        # Special gesture handling
        if ch1 == 1 or ch1 =='E' or ch1 =='S' or ch1 =='X' or ch1 =='Y' or ch1 =='B':
            if (pts[6][1] > pts[8][1] and pts[10][1] < pts[12][1] and pts[14][1] < pts[16][1] and pts[18][1] > pts[20][1]):
                ch1 = " "

        if ch1 == 'E' or ch1=='Y' or ch1=='B':
            if (pts[4][0] < pts[5][0]) and (pts[6][1] > pts[8][1] and pts[10][1] > pts[12][1] and pts[14][1] > pts[16][1] and pts[18][1] > pts[20][1]):
                ch1 = "next"

        if ch1 == 'Next' or ch1 == 'B' or ch1 == 'C' or ch1 == 'H' or ch1 == 'F' or ch1 == 'X':
            if (pts[0][0] > pts[8][0] and pts[0][0] > pts[12][0] and pts[0][0] > pts[16][0] and pts[0][0] > pts[20][0]) and (pts[4][1] < pts[8][1] and pts[4][1] < pts[12][1] and pts[4][1] < pts[16][1] and pts[4][1] < pts[20][1]) and (pts[4][1] < pts[6][1] and pts[4][1] < pts[10][1] and pts[4][1] < pts[14][1] and pts[4][1] < pts[18][1]):
                ch1 = 'Backspace'

        return ch1

# Initialize predictor
predictor = SignLanguagePredictor(model)

@app.route('/api/detect-sign', methods=['POST'])
def detect_sign():
    global detector_error_count
    try:
        data = request.json
        image_data = data.get('image')

        if not image_data:
            logger.error("No image data provided")
            return jsonify({'error': 'No image data provided'}), 400

        logger.info("📸 Received image data")

        # Decode base64 image
        image_data = image_data.split(',')[1]  # Remove data:image/jpeg;base64, prefix
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            logger.error("Failed to decode image")
            return jsonify({'error': 'Invalid image data'}), 400

        logger.info(f"📐 Frame shape: {frame.shape}")

        # ===== STAGE 1: Detect hands in full frame =====
        try:
            hands = hd.findHands(frame, draw=False, flipType=True)
        except ValueError as e:
            if "timestamp" in str(e).lower():
                logger.warning(f"⚠️ MediaPipe timestamp error, reinitializing...")
                detector_error_count += 1
                if detector_error_count >= MAX_DETECTOR_ERRORS:
                    reinitialize_detector()
                hands = hd.findHands(frame, draw=False, flipType=True)
            else:
                raise

        logger.info(f"🤚 Hands detected in stage 1: {len(hands) if hands else 0}")

        if not hands or not hands[0]:
            logger.info("🔍 No hand detected in frame")
            return jsonify({
                'success': False,
                'message': 'No hand detected',
                'hand_detected': False
            })

        # ===== STAGE 2: Refine detection in cropped hand region =====
        hand = hands[0]
        bbox = hand[0]['bbox']
        x, y, w, h = bbox

        logger.info(f"💼 Hand bbox: x={x}, y={y}, w={w}, h={h}")

        # Crop hand region with offset
        hand_region = frame[y - offset:y + h + offset, x - offset:x + w + offset]

        if hand_region.size == 0:
            logger.warning("⚠️ Hand region crop is empty")
            return jsonify({
                'success': False,
                'message': 'Invalid hand region',
                'hand_detected': False
            })

        # Stage 2: Detect hand in cropped region for refinement
        try:
            hands_refined = hd2.findHands(hand_region, draw=False, flipType=True)
        except ValueError as e:
            if "timestamp" in str(e).lower():
                logger.warning(f"⚠️ Timestamp error in stage 2, using stage 1 result...")
                hands_refined = []
            else:
                raise

        logger.info(f"🤚 Hands detected in stage 2 (refined): {len(hands_refined) if hands_refined else 0}")

        # Use refined landmarks if available, otherwise use stage 1
        if hands_refined and hands_refined[0]:
            hand_landmarks = hands_refined[0][0]['lmList']
            logger.info(f"✋ Using refined landmarks from stage 2")
        else:
            hand_landmarks = hand[0]['lmList']
            logger.info(f"✋ Using landmarks from stage 1")

        logger.info(f"📌 Hand landmarks: {len(hand_landmarks)} points")

        # Predict gesture
        prediction_result = predictor.predict_gesture(hand_landmarks)

        if prediction_result:
            logger.info(f"🎯 Prediction: {prediction_result}")
            return jsonify({
                'success': True,
                'character': prediction_result['character'],
                'accumulated_text': prediction_result['accumulated_text'],
                'confidence': prediction_result['confidence'],
                'hand_detected': True,
                'skeleton_image': prediction_result.get('skeleton_image')  # Include skeleton visualization
            })
        else:
            logger.warning("❌ Prediction failed")

        logger.info("🔍 Prediction returned None")
        return jsonify({
            'success': False,
            'message': 'Prediction failed',
            'hand_detected': True
        })

    except Exception as e:
        logger.error(f"💥 Error in detect_sign: {e}")
        logger.error(f"💥 Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/test-model', methods=['POST'])
def test_model():
    """Test endpoint to debug model predictions"""
    try:
        # Create a simple test image (white background)
        test_image = np.ones((400, 400, 3), dtype=np.uint8) * 255
        
        # Test prediction
        test_reshaped = test_image.reshape(1, 400, 400, 3)
        
        try:
            prob = np.array(model.predict(test_reshaped, verbose=0)[0], dtype='float32')
            top_indices = np.argsort(prob)[-5:][::-1]  # Top 5 predictions
            top_predictions = [(int(idx), float(prob[idx])) for idx in top_indices]
            
            logger.info(f"🧪 Test model predictions: {top_predictions}")
            
            return jsonify({
                'success': True,
                'predictions': top_predictions,
                'message': 'Model test completed'
            })
        except Exception as e:
            logger.error(f"Model test error: {e}")
            return jsonify({'error': str(e)}), 500
            
    except Exception as e:
        logger.error(f"Test endpoint error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/clear-text', methods=['POST'])
def clear_text():
    try:
        # Reset the accumulated text in the predictor
        predictor.str = " "
        predictor.prev_char = ""
        predictor.count = -1
        predictor.ten_prev_char = [" "] * 10
        
        return jsonify({
            'success': True,
            'message': 'Text cleared successfully'
        })
        
    except Exception as e:
        print(f"Error in clear_text: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
