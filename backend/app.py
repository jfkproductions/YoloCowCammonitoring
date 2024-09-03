from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Load the YOLO model (YOLOv8 extra-large for better accuracy)
model = YOLO("yolov8x.pt")  # Extra-large YOLOv8 model for higher accuracy

@app.route('/detect_cows', methods=['POST'])
def detect_cows():
    try:
        print("YOLO endpoint hit. Processing image...")
        img_data = request.files.get('image')
        if img_data is None:
            print("No image data received")
            return jsonify({'error': 'No image data received'}), 400

        # Read the image from the request
        np_img = np.frombuffer(img_data.read(), np.uint8)
        image = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if image is None:
            print("Failed to decode image")
            return jsonify({'error': 'Failed to decode image'}), 400

        # Run YOLO model on the image with augmentations and a lower confidence threshold
        results = model.predict(image, imgsz=1024, augment=True, conf=0.25)

        # Initialize counters
        standing_count = 0
        laying_count = 0

        if results[0].boxes:  # Ensure that boxes are present
            for r in results[0].boxes:
                try:
                    if r.cls == 21:  # COCO class ID for cow is 21
                        # Infer posture based on bounding box dimensions (simplistic approach)
                        box = r.xyxy[0]  # Ensure xyxy[0] is the correct access pattern
                        width = box[2] - box[0]
                        height = box[3] - box[1]

                        if height > width:  # Assuming standing cows are taller than they are wide
                            standing_count += 1
                        else:  # Assuming laying cows are wider than they are tall
                            laying_count += 1
                except IndexError as e:
                    print(f"Indexing error: {e}")
                    continue

        total_cows = standing_count + laying_count

        print(f"Detected cows using YOLO: {total_cows} total, {standing_count} standing, {laying_count} laying")
        return jsonify({
            'total_cows': total_cows,
            'standing_cows': standing_count,
            'laying_cows': laying_count
        })

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': 'An error occurred on the server'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
