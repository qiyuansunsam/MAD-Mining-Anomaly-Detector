#!/usr/bin/env python3
"""
Quick debug script to understand YOLO model structure and metrics types.
"""

import os
import numpy as np
from ultralytics import YOLO

def inspect_model_structure(model_path, model_name):
    """Inspect YOLO model structure without running validation."""
    print(f"\n=== Inspecting {model_name} ===")
    
    try:
        model = YOLO(model_path)
        print(f"Model classes: {model.names}")
        print(f"Number of classes: {len(model.names)}")
        
        # Create a mock results object structure based on typical YOLO outputs
        print("\n--- Expected Results Structure ---")
        print("For single-class models:")
        print("  - map50, map, mp, mr, f1: typically numpy.float64 scalars")
        print("  - Can use .item() or float() conversion")
        
        print("\nFor multi-class models:")
        print("  - map50, map, mp, mr, f1: typically numpy arrays or tensors")
        print("  - Need to handle array-to-scalar conversion properly")
        print("  - Common patterns:")
        print("    - Overall metrics: mean across classes")
        print("    - Per-class metrics: arrays with one value per class")
        
        return True
        
    except Exception as e:
        print(f"Error inspecting {model_name}: {str(e)}")
        return False

def demonstrate_conversion_methods():
    """Demonstrate different methods to handle array-to-scalar conversion."""
    print("\n" + "="*60)
    print("ARRAY-TO-SCALAR CONVERSION METHODS")
    print("="*60)
    
    # Test different numpy array scenarios
    test_cases = [
        ("Single scalar float", np.float64(0.95)),
        ("Single element array", np.array([0.95])),
        ("Multi-element array (needs mean)", np.array([0.95, 0.89, 0.92])),
        ("Zero-dimensional array", np.array(0.95)),
        ("Python float", 0.95),
        ("Python int", 1),
        ("None value", None)
    ]
    
    def safe_round_v1(value, decimals=4):
        """Original safe_round function from the code."""
        if value is None:
            return 0.0
        if hasattr(value, 'item'):  # Handle numpy scalars
            return round(float(value.item()), decimals)
        elif isinstance(value, (int, float)):
            return round(float(value), decimals)
        else:
            return 0.0
    
    def safe_round_v2(value, decimals=4):
        """Improved safe_round function to handle arrays."""
        if value is None:
            return 0.0
        
        # Handle numpy arrays
        if isinstance(value, np.ndarray):
            if value.size == 0:  # Empty array
                return 0.0
            elif value.size == 1:  # Single element array
                return round(float(value.item()), decimals)
            else:  # Multi-element array - use mean
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
        
        # Fallback
        try:
            return round(float(value), decimals)
        except (ValueError, TypeError):
            return 0.0
    
    print("\nTesting conversion methods:")
    for name, test_value in test_cases:
        print(f"\n{name}: {test_value} (type: {type(test_value)})")
        
        # Test original function
        try:
            result_v1 = safe_round_v1(test_value)
            print(f"  Original safe_round: {result_v1}")
        except Exception as e:
            print(f"  Original safe_round ERROR: {e}")
        
        # Test improved function
        try:
            result_v2 = safe_round_v2(test_value)
            print(f"  Improved safe_round: {result_v2}")
        except Exception as e:
            print(f"  Improved safe_round ERROR: {e}")

def main():
    """Main function."""
    
    # Test model structures
    test_models = [
        {
            'name': 'Single-class (coal_miner)',
            'model_path': '/home/epsilon/work/mad/backend/models/coal_miner_model.pt'
        },
        {
            'name': 'Multi-class (hydraulic_support)',
            'model_path': '/home/epsilon/work/mad/backend/models/hydraulic_support_model.pt'
        },
        {
            'name': 'Multi-class (miner_behavior)', 
            'model_path': '/home/epsilon/work/mad/backend/models/miner_behavior_model.pt'
        }
    ]
    
    for model_config in test_models:
        if os.path.exists(model_config['model_path']):
            inspect_model_structure(model_config['model_path'], model_config['name'])
        else:
            print(f"\nSkipping {model_config['name']} - file not found")
    
    # Demonstrate conversion methods
    demonstrate_conversion_methods()
    
    print("\n" + "="*60)
    print("ANALYSIS SUMMARY")
    print("="*60)
    print("""
The 'can only convert an array of size 1 to a Python scalar' error occurs when:

1. YOLO validation returns metrics as numpy arrays instead of scalars
2. The safe_round() function tries to use .item() on multi-element arrays
3. This typically happens with multi-class models where metrics are per-class

SOLUTIONS:
1. Check if value is an array and handle appropriately
2. Use np.mean() for multi-element arrays
3. Use .item() only for single-element arrays
4. Add proper error handling for edge cases

The improved safe_round_v2() function above handles all these cases.
""")

if __name__ == "__main__":
    main()