"""
Comprehensive Training Script for Mining Safety Anomaly Detection Models
Trains 6 specialized models and 1 general model using YOLO architecture
"""

import os
import sys
import yaml
import json
import shutil
import logging
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import random
import cv2
import numpy as np
from tqdm import tqdm

import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# Import Ultralytics YOLO and required modules
from ultralytics import YOLO
from ultralytics.models.yolo.detect import DetectionTrainer
from ultralytics.utils import DEFAULT_CFG
from ultralytics.data.utils import check_det_dataset

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DatasetPreparator:
    """Prepares datasets for YOLO training"""
    
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.backend_path = Path('/home/epsilon/work/mad/backend/datasets')
        self.root_data_path = Path('../data2023_yolo')
        
        self.datasets = {
            'coal_miner_data2023_yolo': 'coal_miner',
            'hydraulic_support_guard_plate_data2023_yolo': 'hydraulic_support',
            'large_coal_data2023_yolo': 'large_coal',
            'mine_safety_helmet__data2023_yolo': 'mine_safety_helmet',
            'miner_behavior_data2023_yolo': 'miner_behavior',
            'towline_data2023_yolo': 'towline'
        }
    
    def prepare_dataset(self, dataset_name: str) -> Dict:
        """Prepare a single dataset for training"""
        short_name = self.datasets.get(dataset_name, dataset_name)
        
        # Check backend datasets first (already processed)
        backend_dataset_path = self.backend_path / short_name
        if backend_dataset_path.exists() and (backend_dataset_path / 'data.yaml').exists():
            logger.info(f"Using existing backend dataset: {backend_dataset_path}")
            with open(backend_dataset_path / 'data.yaml', 'r') as f:
                return yaml.safe_load(f)
        
        # Check root data2023_yolo folder
        root_dataset_path = self.root_data_path / dataset_name
        if root_dataset_path.exists():
            logger.info(f"Found dataset in root folder: {root_dataset_path}")
            dataset_path = root_dataset_path
        else:
            # Fallback to base_path
            dataset_path = self.base_path / dataset_name
            if not dataset_path.exists():
                logger.error(f"Dataset {dataset_name} not found in any location")
                logger.error(f"  Checked: {backend_dataset_path}")
                logger.error(f"  Checked: {root_dataset_path}")
                logger.error(f"  Checked: {dataset_path}")
                return None
        
        # Create YOLO dataset structure
        yolo_path = Path('datasets') / self.datasets.get(dataset_name, dataset_name)
        yolo_path.mkdir(parents=True, exist_ok=True)
        
        # Setup directories
        for split in ['train', 'val', 'test']:
            (yolo_path / 'images' / split).mkdir(parents=True, exist_ok=True)
            (yolo_path / 'labels' / split).mkdir(parents=True, exist_ok=True)
        
        # Process images and labels
        images_path = dataset_path / 'images'
        labels_path = dataset_path / 'labels'
        
        # Check if the dataset is already split (has train/val/test subdirs)
        if (images_path / 'train').exists():
            # Dataset already has train/val splits, use them directly
            logger.info(f"Dataset {dataset_name} already has splits, using existing structure")
            
            # Copy existing structure
            for split in ['train', 'val', 'test']:
                src_img_dir = images_path / split
                src_label_dir = labels_path / split
                
                if src_img_dir.exists():
                    for img_path in src_img_dir.glob('*'):
                        if img_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                            dest_img = yolo_path / 'images' / split / img_path.name
                            shutil.copy2(img_path, dest_img)
                            
                            # Copy corresponding label
                            label_name = img_path.stem + '.txt'
                            label_path = src_label_dir / label_name
                            
                            if label_path.exists() and label_path.stat().st_size > 0:
                                dest_label = yolo_path / 'labels' / split / label_name
                                shutil.copy2(label_path, dest_label)
            
            # Create data.yaml file
            data_yaml = self.create_data_yaml(yolo_path, dataset_name)
            
            # Count files for logging
            train_count = len(list((yolo_path / 'images' / 'train').glob('*')))
            val_count = len(list((yolo_path / 'images' / 'val').glob('*')))
            test_count = len(list((yolo_path / 'images' / 'test').glob('*')))
            
            logger.info(f"Dataset {dataset_name} prepared successfully")
            logger.info(f"  Train: {train_count} images")
            logger.info(f"  Val: {val_count} images")
            logger.info(f"  Test: {test_count} images")
            
            return data_yaml
            
        elif images_path.exists() and labels_path.exists():
            # Dataset needs to be split, collect all images
            all_images = list(images_path.glob('*.jpg')) + list(images_path.glob('*.png'))
            
            # Split data: 70% train, 20% val, 10% test
            random.shuffle(all_images)
            n_images = len(all_images)
            n_train = int(0.7 * n_images)
            n_val = int(0.2 * n_images)
            
            splits = {
                'train': all_images[:n_train],
                'val': all_images[n_train:n_train + n_val],
                'test': all_images[n_train + n_val:]
            }
            
            # Copy files to appropriate directories
            for split_name, split_images in splits.items():
                for img_path in tqdm(split_images, desc=f"Processing {split_name}"):
                    # Copy image
                    dest_img = yolo_path / 'images' / split_name / img_path.name
                    shutil.copy2(img_path, dest_img)
                    
                    # Copy corresponding label
                    label_name = img_path.stem + '.txt'
                    label_path = labels_path / label_name
                    
                    if label_path.exists():
                        dest_label = yolo_path / 'labels' / split_name / label_name
                        shutil.copy2(label_path, dest_label)
            
            # Create data.yaml file
            data_yaml = self.create_data_yaml(yolo_path, dataset_name)
            
            logger.info(f"Dataset {dataset_name} prepared successfully")
            logger.info(f"  Train: {len(splits['train'])} images")
            logger.info(f"  Val: {len(splits['val'])} images")
            logger.info(f"  Test: {len(splits['test'])} images")
            
            return data_yaml
        else:
            logger.error(f"Images or labels directory not found for {dataset_name}")
            return None
    
    def create_data_yaml(self, dataset_path: Path, dataset_name: str) -> Dict:
        """Create YOLO data.yaml configuration"""
        # Detect number of classes from label files
        all_classes = set()
        for label_file in (dataset_path / 'labels' / 'train').glob('*.txt'):
            with open(label_file, 'r') as f:
                for line in f:
                    parts = line.strip().split()
                    if parts:
                        all_classes.add(int(parts[0]))
        
        nc = max(all_classes) + 1 if all_classes else 1
        
        # Define class names based on dataset
        class_names = self.get_class_names(dataset_name, nc)
        
        data_yaml = {
            'path': str(dataset_path.absolute()),
            'train': 'images/train',
            'val': 'images/val',
            'test': 'images/test',
            'nc': nc,
            'names': class_names
        }
        
        yaml_path = dataset_path / 'data.yaml'
        with open(yaml_path, 'w') as f:
            yaml.dump(data_yaml, f, default_flow_style=False)
        
        return data_yaml
    
    def get_class_names(self, dataset_name: str, nc: int) -> List[str]:
        """Get class names for specific dataset"""
        class_mappings = {
            'coal_miner_data2023_yolo': ['person', 'miner', 'equipment'],
            'hydraulic_support_guard_plate _data2023_yolo': ['support', 'plate', 'damage'],
            'large_coal_data2023_yolo': ['large_coal', 'normal_coal', 'debris'],
            'mine_safety_helmet__data2023_yolo': ['helmet', 'no_helmet', 'person'],
            'miner_behavior _data2023_yolo': ['safe', 'unsafe', 'warning'],
            'towline _data2023_yolo': ['towline', 'damage', 'obstruction']
        }
        
        if dataset_name in class_mappings:
            names = class_mappings[dataset_name]
            # Extend with generic names if needed
            while len(names) < nc:
                names.append(f'class_{len(names)}')
            return names[:nc]
        else:
            return [f'class_{i}' for i in range(nc)]
    
    def prepare_general_dataset(self) -> Dict:
        """Combine all datasets for general model training"""
        general_path = Path('datasets') / 'general'
        general_path.mkdir(parents=True, exist_ok=True)
        
        for split in ['train', 'val', 'test']:
            (general_path / 'images' / split).mkdir(parents=True, exist_ok=True)
            (general_path / 'labels' / split).mkdir(parents=True, exist_ok=True)
        
        # Combine all datasets
        class_offset = 0
        all_class_names = []
        
        for dataset_name, short_name in self.datasets.items():
            dataset_path = Path('datasets') / short_name
            
            if not dataset_path.exists():
                logger.warning(f"Skipping {dataset_name} - not prepared")
                continue
            
            # Load dataset yaml
            yaml_path = dataset_path / 'data.yaml'
            if yaml_path.exists():
                with open(yaml_path, 'r') as f:
                    data_info = yaml.safe_load(f)
                
                # Add class names with prefix
                for class_name in data_info['names']:
                    all_class_names.append(f"{short_name}_{class_name}")
                
                # Copy and adjust labels
                for split in ['train', 'val', 'test']:
                    images_dir = dataset_path / 'images' / split
                    labels_dir = dataset_path / 'labels' / split
                    
                    for img_path in images_dir.glob('*'):
                        # Copy image with dataset prefix
                        new_img_name = f"{short_name}_{img_path.name}"
                        dest_img = general_path / 'images' / split / new_img_name
                        shutil.copy2(img_path, dest_img)
                        
                        # Adjust and copy label
                        label_path = labels_dir / (img_path.stem + '.txt')
                        if label_path.exists():
                            new_label_name = f"{short_name}_{img_path.stem}.txt"
                            dest_label = general_path / 'labels' / split / new_label_name
                            
                            # Adjust class indices
                            with open(label_path, 'r') as f:
                                lines = f.readlines()
                            
                            with open(dest_label, 'w') as f:
                                for line in lines:
                                    parts = line.strip().split()
                                    if parts:
                                        parts[0] = str(int(parts[0]) + class_offset)
                                        f.write(' '.join(parts) + '\n')
                
                class_offset += data_info['nc']
        
        # Create general data.yaml
        general_yaml = {
            'path': str(general_path.absolute()),
            'train': 'images/train',
            'val': 'images/val',
            'test': 'images/test',
            'nc': len(all_class_names),
            'names': all_class_names
        }
        
        yaml_path = general_path / 'data.yaml'
        with open(yaml_path, 'w') as f:
            yaml.dump(general_yaml, f, default_flow_style=False)
        
        logger.info(f"General dataset prepared with {len(all_class_names)} classes")
        return general_yaml

class ModelTrainer:
    """Handles model training with custom configurations"""
    
    def __init__(self, config_path: str = None):
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        logger.info(f"Training device: {self.device}")
        
        # Load custom model configuration if provided
        self.custom_config = None
        if config_path and Path(config_path).exists():
            with open(config_path, 'r') as f:
                self.custom_config = yaml.safe_load(f)
            logger.info(f"Loaded custom configuration from {config_path}")
    
    def train_model(
        self,
        dataset_name: str,
        data_yaml: Dict,
        epochs: int = 100,
        batch_size: int = 16,
        imgsz: int = 640,
        model_size: str = 's'
    ) -> Path:
        """Train a single model"""
        
        # Select base model
        if self.custom_config:
            model = YOLO(self.custom_config)
            logger.info("Using custom model architecture")
        else:
            model_name = f'yolov8{model_size}.pt'
            model = YOLO(model_name)
            logger.info(f"Using base model: {model_name}")
        
        # Training arguments (updated for current Ultralytics API)
        train_args = {
            'data': data_yaml['path'] + '/data.yaml',
            'epochs': epochs,
            'batch': batch_size,
            'imgsz': imgsz,
            'device': self.device,
            'project': 'runs/train',
            'name': f"{dataset_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'exist_ok': True,
            'pretrained': True,
            'optimizer': 'AdamW',
            'lr0': 0.001,
            'lrf': 0.01,
            'momentum': 0.937,
            'weight_decay': 0.0005,
            'warmup_epochs': 3,
            'warmup_momentum': 0.8,
            'warmup_bias_lr': 0.1,
            'box': 7.5,  # Updated parameter name
            'cls': 0.5,
            'dfl': 1.5,  # Distribution focal loss
            'pose': 12.0,  # Pose loss gain
            'kobj': 1.0,  # Keypoint objectness loss gain
            'label_smoothing': 0.0,
            'nbs': 64,  # Nominal batch size
            'hsv_h': 0.015,
            'hsv_s': 0.7,
            'hsv_v': 0.4,
            'degrees': 0.0,
            'translate': 0.1,
            'scale': 0.5,
            'shear': 0.0,
            'perspective': 0.0,
            'flipud': 0.0,
            'fliplr': 0.5,
            'mosaic': 1.0,
            'mixup': 0.0,
            'copy_paste': 0.0,
            'patience': 50,
            'save': True,
            'save_period': -1,
            'cache': False,  # Set to False to avoid memory issues
            'workers': 8,
            'amp': True,
            'close_mosaic': 10,
            'resume': False,
            'fraction': 1.0,
            'profile': False,
            'overlap_mask': True,
            'mask_ratio': 4,
            'dropout': 0.0,
            'val': False,
            'plots': False,
            'verbose': True
        }
        
        # Train the model
        logger.info(f"Starting training for {dataset_name}")
        results = model.train(**train_args)
        
        # Save the best model
        best_model_path = Path(train_args['project']) / train_args['name'] / 'weights' / 'best.pt'
        output_path = Path('models') / f'{dataset_name}_model.pt'
        output_path.parent.mkdir(exist_ok=True)
        
        if best_model_path.exists():
            shutil.copy2(best_model_path, output_path)
            logger.info(f"Model saved to {output_path}")
        
        return output_path
    
    def evaluate_model(self, model_path: Path, data_yaml: Dict) -> Dict:
        """Evaluate trained model"""
        model = YOLO(str(model_path))
        
        # Run validation
        results = model.val(
            data=data_yaml['path'] + '/data.yaml',
            split='val',
            batch=1,
            device=self.device,
            plots=True,
            save_json=True
        )
        
        metrics = {
            'precision': results.box.mp,
            'recall': results.box.mr,
            'mAP50': results.box.map50,
            'mAP50-95': results.box.map
        }
        
        logger.info(f"Evaluation results: {metrics}")
        return metrics

def main():
    parser = argparse.ArgumentParser(description='Train anomaly detection models')
    parser.add_argument('--data_path', type=str, default='../data2023_yolo',
                        help='Path to dataset directory')
    parser.add_argument('--config', type=str, default='helmet-detection.yaml',
                        help='Path to custom model configuration')
    parser.add_argument('--epochs', type=int, default=5,
                        help='Number of training epochs')
    parser.add_argument('--batch_size', type=int, default=16,
                        help='Batch size for training')
    parser.add_argument('--imgsz', type=int, default=640,
                        help='Image size for training')
    parser.add_argument('--model_size', type=str, default='s',
                        choices=['n', 's', 'm', 'l', 'x'],
                        help='YOLOv8 model size')
    parser.add_argument('--train_all', action='store_true',
                        help='Train all models including general')
    parser.add_argument('--general', action='store_true',
                        help='Train general model')
    parser.add_argument('--dataset', type=str, default=None,
                        help='Train specific dataset only')
    
    args = parser.parse_args()
    
    # Initialize components
    preparator = DatasetPreparator(args.data_path)
    trainer = ModelTrainer(args.config)
    
    # Track training results
    training_results = {}
    
    if args.train_all:
        # Train all specialized models
        for dataset_name in preparator.datasets.keys():
            logger.info(f"\n{'='*50}")
            logger.info(f"Processing {dataset_name}")
            logger.info('='*50)
            
            # Prepare dataset
            data_yaml = preparator.prepare_dataset(dataset_name)
            
            if data_yaml:
                # Train model
                model_path = trainer.train_model(
                    preparator.datasets[dataset_name],
                    data_yaml,
                    epochs=args.epochs,
                    batch_size=args.batch_size,
                    imgsz=args.imgsz,
                    model_size=args.model_size
                )
                
                # Skip evaluation for faster training
                # metrics = trainer.evaluate_model(model_path, data_yaml)
                training_results[dataset_name] = {'status': 'trained', 'validation': 'disabled'}
        
        # Train general model
        logger.info(f"\n{'='*50}")
        logger.info("Training General Model")
        logger.info('='*50)
        
        general_yaml = preparator.prepare_general_dataset()
        if general_yaml:
            model_path = trainer.train_model(
                'general',
                general_yaml,
                epochs=args.epochs,
                batch_size=args.batch_size,
                imgsz=args.imgsz,
                model_size=args.model_size
            )
            
            # Skip evaluation for faster training  
            # metrics = trainer.evaluate_model(model_path, general_yaml)
            training_results['general'] = {'status': 'trained', 'validation': 'disabled'}
    elif args.general:
        general_yaml = preparator.prepare_general_dataset()
        if general_yaml:
            model_path = trainer.train_model(
                'general',
                general_yaml,
                epochs=args.epochs,
                batch_size=args.batch_size,
                imgsz=args.imgsz,
                model_size=args.model_size
            )
            
            # Skip evaluation for faster training  
            # metrics = trainer.evaluate_model(model_path, general_yaml)
            training_results['general'] = {'status': 'trained', 'validation': 'disabled'}
    
    
    elif args.dataset:
        # Train specific dataset
        if args.dataset in preparator.datasets:
            data_yaml = preparator.prepare_dataset(args.dataset)
            if data_yaml:
                model_path = trainer.train_model(
                    preparator.datasets[args.dataset],
                    data_yaml,
                    epochs=args.epochs,
                    batch_size=args.batch_size,
                    imgsz=args.imgsz,
                    model_size=args.model_size
                )
                
                # Skip evaluation for faster training
                # metrics = trainer.evaluate_model(model_path, data_yaml)
                training_results[args.dataset] = {'status': 'trained', 'validation': 'disabled'}
        else:
            logger.error(f"Dataset {args.dataset} not found")
    
    else:
        # Default: train mine_safety_helmet model
        dataset_name = 'mine_safety_helmet__data2023_yolo'
        data_yaml = preparator.prepare_dataset(dataset_name)
        
        if data_yaml:
            model_path = trainer.train_model(
                'mine_safety_helmet',
                data_yaml,
                epochs=args.epochs,
                batch_size=args.batch_size,
                imgsz=args.imgsz,
                model_size=args.model_size
            )
            
            # Skip evaluation for faster training
            # metrics = trainer.evaluate_model(model_path, data_yaml)
            training_results[dataset_name] = {'status': 'trained', 'validation': 'disabled'}
    
    # Save training results
    results_path = Path('training_results.json')
    with open(results_path, 'w') as f:
        json.dump(training_results, f, indent=2)
    
    logger.info(f"\nTraining completed! Results saved to {results_path}")
    logger.info("\nSummary:")
    for model_name, metrics in training_results.items():
        logger.info(f"  {model_name}: mAP50={metrics['mAP50']:.3f}, mAP50-95={metrics['mAP50-95']:.3f}")

if __name__ == "__main__":
    main()
