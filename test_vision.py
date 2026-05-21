
from ultralytics import YOLO

# Load model
model = YOLO("haystack_backend/models/yolov8n.pt")

# Inference
results = model("test_tableau.jpg")

# Print what we see
print("\n--- ANALYSE VISION YOLOv8 ---")
for r in results:
    for box in r.boxes:
        cls_id = int(box.cls[0])
        label = model.names[cls_id]
        conf = float(box.conf[0])
        print(f"🔹 DÉTECTION : {label.upper()} (Confiance : {conf:.1%})")

print("\n--- TERMINÉ ---")
