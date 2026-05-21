
from ultralytics import YOLO

def train():
    # Load a model
    model = YOLO("yolov8n.pt")  # load a pretrained model (recommended for training)

    # Train the model
    # We use a very low epoch count because this is a demo environment
    results = model.train(
        data="./datasets/proquelec/data.yaml", 
        epochs=3, 
        imgsz=640,
        project="haystack_backend/models",
        name="proquelec_v1",
        exist_ok=True
    )
    
    # Export or save is automatic to runs/detect/train... but we specified project path
    print(f"✅ Training Complete. Best model saved at haystack_backend/models/proquelec_v1/weights/best.pt")

if __name__ == '__main__':
    train()
