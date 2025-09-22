#!/usr/bin/env python3
"""
Comprehensive model validation script for all trained models.
Generates mAP50, mAP95, model size, and inference time metrics.
"""

import os
import json
import time
import torch
from pathlib import Path
from ultralytics import YOLO
import numpy as np
from datetime import datetime

def get_model_size(model_path):
    """Get model file size in MB."""
    return round(os.path.getsize(model_path) / (1024 * 1024), 2)

def validate_model(model_path, dataset_path, model_name):
    """Validate a single model and return comprehensive metrics."""
    print(f"\n=== Validating {model_name} ===")
    
    try:
        # Load model
        model = YOLO(model_path)
        
        # Get model size
        model_size_mb = get_model_size(model_path)
        
        # Run validation
        print(f"Running validation on dataset: {dataset_path}")
        start_time = time.time()
        
        # Run validation with metrics
        results = model.val(
            data=dataset_path,
            imgsz=640,
            batch=8,  # Reduced batch size for better memory management
            conf=0.001,
            iou=0.6,
            max_det=300,
            half=False,
            device='cpu',  # Use CPU to avoid CUDA issues
            dnn=False,
            plots=False,
            save=False,
            save_txt=False,
            save_conf=False,
            save_json=False,
            verbose=True
        )
        
        validation_time = time.time() - start_time
        
        # Extract metrics with safe conversion
        def safe_round(value, decimals=4):
            """Safely convert various numeric types to rounded floats.
            
            Handles:
            - Python scalars (int, float)
            - NumPy scalars (numpy.float64, etc.)
            - Single-element arrays
            - Multi-element arrays (uses mean)
            - PyTorch tensors
            - None values
            """
            if value is None:
                return 0.0
            
            # Handle numpy arrays
            if isinstance(value, np.ndarray):
                if value.size == 0:  # Empty array
                    return 0.0
                elif value.size == 1:  # Single element array
                    return round(float(value.item()), decimals)
                else:  # Multi-element array - use mean for overall metric
                    return round(float(np.mean(value)), decimals)
            
            # Handle numpy scalars and other types with .item()
            if hasattr(value, 'item'):
                try:
                    return round(float(value.item()), decimals)
                except (ValueError, TypeError):
                    pass
            
            # Handle regular Python numbers
            if isinstance(value, (int, float)):
                return round(float(value), decimals)
            
            # Handle PyTorch tensors
            if hasattr(value, 'cpu') and hasattr(value, 'numpy'):
                try:
                    arr = value.cpu().numpy()
                    if arr.size == 1:
                        return round(float(arr.item()), decimals)
                    else:
                        return round(float(np.mean(arr)), decimals)
                except (ValueError, TypeError):
                    pass
            
            # Fallback: try direct conversion
            try:
                return round(float(value), decimals)
            except (ValueError, TypeError):
                return 0.0
        
        metrics = {
            'model_name': model_name,
            'model_path': model_path,
            'dataset_path': dataset_path,
            'model_size_mb': model_size_mb,
            'validation_time_seconds': round(validation_time, 2),
            'map50': safe_round(results.box.map50),
            'map95': safe_round(results.box.map),
            'precision': safe_round(results.box.mp),
            'recall': safe_round(results.box.mr),
            'f1_score': safe_round(results.box.f1),
            'num_images': len(results.box.map50_per_class) if hasattr(results.box, 'map50_per_class') and results.box.map50_per_class is not None else 0,
            'classes': model.names if hasattr(model, 'names') else [],
            'device': str(results.device) if hasattr(results, 'device') else 'unknown'
        }
        
        # Calculate inference speed (images per second)
        if validation_time > 0 and metrics['num_images'] > 0:
            metrics['inference_speed_fps'] = round(metrics['num_images'] / validation_time, 2)
        else:
            metrics['inference_speed_fps'] = 0.0
        
        # Add per-class metrics if available
        if hasattr(results.box, 'map50_per_class') and results.box.map50_per_class is not None:
            per_class_map50 = results.box.map50_per_class.tolist()
            metrics['per_class_map50'] = {
                model.names[i]: safe_round(per_class_map50[i]) 
                for i in range(len(per_class_map50)) 
                if i < len(model.names)
            }
        
        if hasattr(results.box, 'map_per_class') and results.box.map_per_class is not None:
            per_class_map95 = results.box.map_per_class.tolist()
            metrics['per_class_map95'] = {
                model.names[i]: safe_round(per_class_map95[i]) 
                for i in range(len(per_class_map95)) 
                if i < len(model.names)
            }
        
        print(f"✓ {model_name} validation completed:")
        print(f"  mAP50: {metrics['map50']}")
        print(f"  mAP95: {metrics['map95']}")
        print(f"  Model size: {metrics['model_size_mb']} MB")
        print(f"  Inference speed: {metrics['inference_speed_fps']} FPS")
        print(f"  Validation time: {metrics['validation_time_seconds']} seconds")
        
        # Clean up memory after validation
        del model
        del results
        import gc
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        return metrics
        
    except Exception as e:
        print(f"✗ Error validating {model_name}: {str(e)}")
        return {
            'model_name': model_name,
            'model_path': model_path,
            'dataset_path': dataset_path,
            'error': str(e),
            'model_size_mb': get_model_size(model_path) if os.path.exists(model_path) else 0,
            'map50': 0.0,
            'map95': 0.0,
            'validation_time_seconds': 0.0,
            'inference_speed_fps': 0.0
        }

def measure_inference_speed(model_path, sample_image_path, iterations=100):
    """Measure pure inference speed on a single image."""
    try:
        model = YOLO(model_path)
        
        # Warm up
        for _ in range(10):
            model.predict(sample_image_path, verbose=False)
        
        # Measure inference time
        start_time = time.time()
        for _ in range(iterations):
            model.predict(sample_image_path, verbose=False)
        total_time = time.time() - start_time
        
        avg_inference_time = total_time / iterations
        fps = 1.0 / avg_inference_time if avg_inference_time > 0 else 0.0
        
        result = {
            'avg_inference_time_ms': round(avg_inference_time * 1000, 2),
            'inference_fps': round(fps, 2)
        }
        
        # Clean up memory after inference testing
        del model
        import gc
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        return result
    except Exception as e:
        print(f"Error measuring inference speed: {str(e)}")
        return {
            'avg_inference_time_ms': 0.0,
            'inference_fps': 0.0
        }

def main():
    """Main validation function."""
    print("Starting comprehensive model validation...")
    
    # Define models and their corresponding datasets
    models_config = {
        'coal_miner': {
            'model_path': '/home/epsilon/work/mad/backend/models/coal_miner_model.pt',
            'dataset_path': '/home/epsilon/work/mad/backend/datasets/coal_miner/data.yaml'
        },
        'hydraulic_support': {
            'model_path': '/home/epsilon/work/mad/backend/models/hydraulic_support_model.pt',
            'dataset_path': '/home/epsilon/work/mad/backend/datasets/hydraulic_support/data.yaml'
        },
        'large_coal': {
            'model_path': '/home/epsilon/work/mad/backend/models/large_coal_model.pt',
            'dataset_path': '/home/epsilon/work/mad/backend/datasets/large_coal/data.yaml'
        },
        'mine_safety_helmet': {
            'model_path': '/home/epsilon/work/mad/backend/models/mine_safety_helmet_model.pt',
            'dataset_path': '/home/epsilon/work/mad/backend/datasets/mine_safety_helmet/data.yaml'
        },
        'miner_behavior': {
            'model_path': '/home/epsilon/work/mad/backend/models/miner_behavior_model.pt',
            'dataset_path': '/home/epsilon/work/mad/backend/datasets/miner_behavior/data.yaml'
        },
        'towline': {
            'model_path': '/home/epsilon/work/mad/backend/models/towline_model.pt',
            'dataset_path': '/home/epsilon/work/mad/backend/datasets/towline/data.yaml'
        },
        'general': {
            'model_path': '/home/epsilon/work/mad/backend/models/general_model.pt',
            'dataset_path': '/home/epsilon/work/mad/backend/datasets/general/data.yaml'
        }
    }
    
    validation_results = {
        'validation_timestamp': datetime.now().isoformat(),
        'system_info': {
            'torch_version': torch.__version__,
            'cuda_available': torch.cuda.is_available(),
            'cuda_version': torch.version.cuda if torch.cuda.is_available() else None,
            'device_count': torch.cuda.device_count() if torch.cuda.is_available() else 0
        },
        'models': {},
        'summary': {}
    }
    
    # Find a sample image for inference speed testing
    sample_image = None
    for model_name, config in models_config.items():
        dataset_dir = os.path.dirname(config['dataset_path'])
        val_images_dir = os.path.join(dataset_dir, 'images', 'val')
        if os.path.exists(val_images_dir):
            for file in os.listdir(val_images_dir):
                if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                    sample_image = os.path.join(val_images_dir, file)
                    break
        if sample_image:
            break
    
    # Validate each model
    total_models = len(models_config)
    valid_models = 0
    total_size = 0.0
    
    for i, (model_name, config) in enumerate(models_config.items(), 1):
        print(f"\n[{i}/{total_models}] Processing {model_name}...")
        
        # Check if model and dataset exist
        if not os.path.exists(config['model_path']):
            print(f"✗ Model not found: {config['model_path']}")
            validation_results['models'][model_name] = {
                'error': 'Model file not found',
                'model_path': config['model_path']
            }
            continue
            
        if not os.path.exists(config['dataset_path']):
            print(f"✗ Dataset not found: {config['dataset_path']}")
            validation_results['models'][model_name] = {
                'error': 'Dataset file not found',
                'dataset_path': config['dataset_path']
            }
            continue
        
        # Validate model
        metrics = validate_model(
            config['model_path'], 
            config['dataset_path'], 
            model_name
        )
        
        # Measure inference speed if sample image available
        if sample_image and 'error' not in metrics:
            print(f"Measuring inference speed for {model_name}...")
            speed_metrics = measure_inference_speed(config['model_path'], sample_image)
            metrics.update(speed_metrics)
        
        validation_results['models'][model_name] = metrics
        
        if 'error' not in metrics:
            valid_models += 1
            total_size += metrics['model_size_mb']
        
        # Additional memory cleanup between models
        import gc
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        print(f"Completed {model_name} ({i}/{total_models}). Memory cleaned up.")
    
    # Generate summary
    if valid_models > 0:
        all_map50 = [m['map50'] for m in validation_results['models'].values() if 'map50' in m and 'error' not in m]
        all_map95 = [m['map95'] for m in validation_results['models'].values() if 'map95' in m and 'error' not in m]
        all_sizes = [m['model_size_mb'] for m in validation_results['models'].values() if 'model_size_mb' in m and 'error' not in m]
        
        validation_results['summary'] = {
            'total_models': total_models,
            'successfully_validated': valid_models,
            'failed_validations': total_models - valid_models,
            'average_map50': round(np.mean(all_map50), 4) if all_map50 else 0.0,
            'average_map95': round(np.mean(all_map95), 4) if all_map95 else 0.0,
            'best_map50_model': max(validation_results['models'].items(), 
                                  key=lambda x: x[1].get('map50', 0))[0] if all_map50 else None,
            'best_map95_model': max(validation_results['models'].items(), 
                                  key=lambda x: x[1].get('map95', 0))[0] if all_map95 else None,
            'total_models_size_mb': round(sum(all_sizes), 2) if all_sizes else 0.0,
            'average_model_size_mb': round(np.mean(all_sizes), 2) if all_sizes else 0.0
        }
    
    # Save results
    output_file = '/home/epsilon/work/mad/backend/validation_results.json'
    with open(output_file, 'w') as f:
        json.dump(validation_results, f, indent=2)
    
    # Print summary
    print(f"\n{'='*60}")
    print("VALIDATION SUMMARY")
    print(f"{'='*60}")
    print(f"Total models: {total_models}")
    print(f"Successfully validated: {valid_models}")
    print(f"Failed validations: {total_models - valid_models}")
    
    if valid_models > 0:
        summary = validation_results['summary']
        print(f"Average mAP50: {summary['average_map50']}")
        print(f"Average mAP95: {summary['average_map95']}")
        print(f"Best mAP50 model: {summary['best_map50_model']}")
        print(f"Best mAP95 model: {summary['best_map95_model']}")
        print(f"Total models size: {summary['total_models_size_mb']} MB")
        print(f"Average model size: {summary['average_model_size_mb']} MB")
    
    print(f"\nResults saved to: {output_file}")
    print("Validation completed!")

if __name__ == "__main__":
    main()