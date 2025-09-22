"""
FastAPI Backend Server for Anomaly Detection Models
Handles image inference for 6 specialized models
"""

import os
import io
import cv2
import time
import base64
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import torch
import logging
from PIL import Image

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Import Ultralytics YOLO
from ultralytics import YOLO

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Anomaly Detection API",
    description="API for mining safety anomaly detection",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configurations
MODEL_CONFIGS = {
    'coal_miner': {
        'path': 'backend/models/coal_miner_model.pt',
        'confidence': 0.5,
        'iou': 0.45,
        'classes': ['anomaly', 'person', 'equipment']
    },
    'hydraulic_support': {
        'path': 'backend/models/hydraulic_support_model.pt',
        'confidence': 0.55,
        'iou': 0.45,
        'classes': ['support', 'damage', 'anomaly']
    },
    'large_coal': {
        'path': 'backend/models/large_coal_model.pt',
        'confidence': 0.5,
        'iou': 0.4,
        'classes': ['large_coal', 'normal_coal', 'debris']
    },
    'mine_safety_helmet': {
        'path': 'backend/models/mine_safety_helmet_model.pt',
        'confidence': 0.6,
        'iou': 0.45,
        'classes': ['helmet', 'no_helmet', 'person']
    },
    'miner_behavior': {
        'path': 'backend/models/miner_behavior_model.pt',
        'confidence': 0.5,
        'iou': 0.45,
        'classes': ['safe_behavior', 'unsafe_behavior', 'warning']
    },
    'towline': {
        'path': 'backend/models/towline_model.pt',
        'confidence': 0.5,
        'iou': 0.45,
        'classes': ['towline', 'damage', 'obstruction']
    },
    'general': {
        'path': 'models/general_model.pt',
        'confidence': 0.45,
        'iou': 0.4,
        'classes': ['coal_miner_person', 'hydraulic_support_support', 'hydraulic_support_plate', 
                   'hydraulic_support_damage', 'large_coal_large_coal', 'mine_safety_helmet_helmet', 
                   'miner_behavior_safe', 'miner_behavior_unsafe', 'towline_normal', 'towline_damage'],
        'available': True  # Enable general model
    }
}

class ModelManager:
    """Manages YOLO models for inference"""
    
    def __init__(self):
        self.models = {}
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        logger.info(f"Using device: {self.device}")
        self.load_models()
    
    def load_models(self):
        """Load all available models"""
        models_dir = Path('backend/models')
        models_dir.mkdir(parents=True, exist_ok=True)
        
        for model_name, config in MODEL_CONFIGS.items():
            # Skip loading unavailable models
            if config.get('available', True) == False:
                logger.info(f"Skipping unavailable model: {model_name}")
                continue
                
            model_path = Path(config['path'])
            
            # Check if model exists, if not use default YOLOv8
            if model_path.exists():
                try:
                    self.models[model_name] = YOLO(str(model_path))
                    logger.info(f"Loaded custom model: {model_name}")
                except Exception as e:
                    logger.warning(f"Failed to load {model_name}: {e}")
                    # Fallback to YOLOv8n
                    self.models[model_name] = YOLO('yolov8n.pt')
            else:
                # Use default YOLOv8n if custom model doesn't exist
                logger.info(f"Model {model_name} not found, using YOLOv8n")
                self.models[model_name] = YOLO('yolov8n.pt')
                # Save the default model to the expected path
                self.models[model_name].save(str(model_path))
    
    def detect(self, image: np.ndarray, model_name: str) -> Dict[str, Any]:
        """Run detection on an image"""
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not available")
        
        # Check if model is marked as unavailable
        if MODEL_CONFIGS.get(model_name, {}).get('available', True) == False:
            raise ValueError(f"Model {model_name} is currently unavailable")
        
        model = self.models[model_name]
        config = MODEL_CONFIGS[model_name]
        
        # Run inference
        start_time = time.time()
        results = model(
            image,
            conf=config['confidence'],
            iou=config['iou'],
            device=self.device,
            verbose=False
        )
        process_time = (time.time() - start_time) * 1000  # Convert to ms
        
        # Process results
        detections = []
        annotated_image = image.copy()
        
        if len(results) > 0 and results[0].boxes is not None:
            boxes = results[0].boxes
            
            for i in range(len(boxes)):
                # Get box coordinates
                x1, y1, x2, y2 = boxes.xyxy[i].tolist()
                conf = boxes.conf[i].item()
                cls = int(boxes.cls[i].item())
                
                # Get class name
                class_name = model.names.get(cls, f'class_{cls}')
                
                # Add to detections list
                detections.append({
                    'x': int(x1),
                    'y': int(y1),
                    'width': int(x2 - x1),
                    'height': int(y2 - y1),
                    'confidence': float(conf),
                    'class': class_name
                })
                
                # Draw on image
                color = self.get_color_for_class(cls)
                cv2.rectangle(annotated_image, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                
                # Add label
                label = f'{class_name} {conf:.2f}'
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
                label_y = int(y1) - 10 if int(y1) - 10 > 10 else int(y1) + 20
                
                cv2.rectangle(
                    annotated_image,
                    (int(x1), label_y - label_size[1] - 4),
                    (int(x1) + label_size[0] + 4, label_y + 4),
                    color,
                    -1
                )
                cv2.putText(
                    annotated_image,
                    label,
                    (int(x1) + 2, label_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 255, 255),
                    1
                )
        
        return {
            'detections': detections,
            'annotated_image': annotated_image,
            'process_time': process_time
        }
    
    @staticmethod
    def get_color_for_class(class_id: int) -> tuple:
        """Get a unique color for each class"""
        colors = [
            (255, 0, 0),      # Red
            (0, 255, 0),      # Green
            (0, 0, 255),      # Blue
            (255, 255, 0),    # Yellow
            (255, 0, 255),    # Magenta
            (0, 255, 255),    # Cyan
            (128, 0, 128),    # Purple
            (255, 165, 0),    # Orange
            (0, 128, 128),    # Teal
            (128, 128, 0),    # Olive
        ]
        return colors[class_id % len(colors)]

# Initialize model manager
model_manager = ModelManager()

class DetectionResponse(BaseModel):
    """Response model for detection endpoint"""
    image: str
    detections: List[Dict[str, Any]]
    processTime: float
    timestamp: str

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Anomaly Detection API",
        "version": "1.0.0",
        "models": [model for model, config in MODEL_CONFIGS.items() if config.get('available', True)]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "device": model_manager.device,
        "models_loaded": len(model_manager.models)
    }

@app.post("/detect", response_model=DetectionResponse)
async def detect_anomaly(
    file: UploadFile = File(...),
    model: str = Form('mine_safety_helmet')
):
    """
    Detect anomalies in uploaded image
    
    Args:
        file: Image file to process
        model: Model to use for detection
    
    Returns:
        Detection results with annotated image
    """
    try:
        # Validate model selection
        if model not in MODEL_CONFIGS:
            raise HTTPException(status_code=400, detail=f"Invalid model: {model}")
        
        # Check if model is available
        if MODEL_CONFIGS.get(model, {}).get('available', True) == False:
            raise HTTPException(status_code=400, detail=f"Model {model} is currently unavailable")
        
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Run detection
        result = model_manager.detect(image, model)
        
        # Convert annotated image to base64
        annotated_image = result['annotated_image']
        annotated_image = cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR)
        _, buffer = cv2.imencode('.jpg', annotated_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        img_data_url = f"data:image/jpeg;base64,{img_base64}"
        
        return DetectionResponse(
            image=img_data_url,
            detections=result['detections'],
            processTime=result['process_time'],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Detection error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def get_models():
    """Get available models and their configurations"""
    return {
        "models": [
            {
                "id": model_id,
                "name": model_id.replace('_', ' ').title(),
                "config": config,
                "available": config.get('available', True)
            }
            for model_id, config in MODEL_CONFIGS.items()
        ]
    }

@app.post("/upload_model")
async def upload_model(
    model_name: str = Form(...),
    file: UploadFile = File(...)
):
    """Upload a custom model file"""
    try:
        if model_name not in MODEL_CONFIGS:
            raise HTTPException(status_code=400, detail=f"Invalid model name: {model_name}")
        
        # Save uploaded model
        model_path = Path(MODEL_CONFIGS[model_name]['path'])
        model_path.parent.mkdir(exist_ok=True)
        
        contents = await file.read()
        with open(model_path, 'wb') as f:
            f.write(contents)
        
        # Reload the model
        try:
            model_manager.models[model_name] = YOLO(str(model_path))
            return {"message": f"Model {model_name} uploaded successfully"}
        except Exception as e:
            os.remove(model_path)
            raise HTTPException(status_code=400, detail=f"Invalid model file: {str(e)}")
            
    except Exception as e:
        logger.error(f"Model upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    # Create models directory if it doesn't exist
    Path("backend/models").mkdir(parents=True, exist_ok=True)
    
    # Run the server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=False
    )