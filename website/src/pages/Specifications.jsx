import React from 'react';
import { Cpu, Zap, Shield, Clock } from 'lucide-react';

const Specifications = () => {
  const specs = [
    {
      category: 'Model Architecture',
      icon: <Cpu className="w-6 h-6" />,
      items: [
        { label: 'Base Model', value: 'YOLOv8/YOLOv11' },
        { label: 'Backbone', value: 'CSPDarknet53' },
        { label: 'Neck', value: 'PANet' },
        { label: 'Input Size', value: '640x640' },
        { label: 'Parameters', value: '~3M (nano), ~22M (medium)' }
      ]
    },
    {
      category: 'Performance Metrics',
      icon: <Zap className="w-6 h-6" />,
      items: [
        { label: 'mAP@0.5 Range', value: '82-99%' },
        { label: 'mAP@0.5:0.95 Range', value: '53-85%' },
        { label: 'Inference Time', value: '7-9ms' },
        { label: 'Processing Speed', value: '109-126 FPS' },
        { label: 'Model Count', value: '6 Available' },
        { label: 'Base Architecture', value: 'YOLOv8' }
      ]
    },
    {
      category: 'Technical Features',
      icon: <Shield className="w-6 h-6" />,
      items: [
        { label: 'Real-time Processing', value: 'Yes' },
        { label: 'Batch Processing', value: 'Yes' },
        { label: 'Video Analysis', value: 'Supported' },
        { label: 'Multi-model Support', value: '6 Available Models' },
        { label: 'Export Formats', value: 'JSON, CSV, XML' }
      ]
    },
    {
      category: 'Deployment',
      icon: <Clock className="w-6 h-6" />,
      items: [
        { label: 'Model Format', value: 'PyTorch (.pt)' },
        { label: 'API Framework', value: 'FastAPI' },
        { label: 'Frontend', value: 'Electron + React' },
        { label: 'Model Size', value: '21MB per model' },
        { label: 'Startup Time', value: '<10 seconds' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Specifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {specs.map((spec, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-accent/10 rounded-lg mr-4">
                  {spec.icon}
                </div>
                <h2 className="text-2xl font-semibold text-primary">{spec.category}</h2>
              </div>
              
              <div className="space-y-4">
                {spec.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700 font-medium">{item.label}</span>
                    <span className="text-accent font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Model Performance Breakdown */}
        <div className="mt-12 bg-gray-50 rounded-xl p-8">
          <h3 className="text-2xl font-semibold text-primary mb-6 text-center">Individual Model Performance (mAP@0.5)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">99%</div>
              <div className="text-gray-600">Towline Detection</div>
              <div className="text-xs text-gray-500 mt-1">Best performing model</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">96%</div>
              <div className="text-gray-600">Coal Miner Detection</div>
              <div className="text-xs text-gray-500 mt-1">Person class detection</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">94%</div>
              <div className="text-gray-600">Safety Helmet Detection</div>
              <div className="text-xs text-gray-500 mt-1">PPE compliance monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">82%</div>
              <div className="text-gray-600">Large Coal Detection</div>
              <div className="text-xs text-gray-500 mt-1">Hazard identification</div>
            </div>
            <div className="text-center bg-gray-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-400 mb-2">N/A</div>
              <div className="text-gray-500">Hydraulic Support</div>
              <div className="text-xs text-gray-400 mt-1">Under development</div>
            </div>
            <div className="text-center bg-gray-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-400 mb-2">N/A</div>
              <div className="text-gray-500">Miner Behavior Analysis</div>
              <div className="text-xs text-gray-400 mt-1">Under development</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Specifications;
