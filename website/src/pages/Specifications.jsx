import React from 'react';
import { Cpu, Zap, Shield, Clock, Activity, Target, Gauge } from 'lucide-react';

const Specifications = () => {
  // Individual model performance data from validation results
  const modelPerformance = [
    {
      name: 'Towline Detection',
      type: 'Specialized',
      mAP50: 99.28,
      mAP95: 85.03,
      precision: 97.88,
      recall: 98.63,
      f1Score: 98.25,
      inferenceTime: 7.96,
      fps: 125.67,
      modelSize: 21.46,
      classes: 1,
      description: 'Cable and obstruction detection',
      icon: <Activity className="w-6 h-6" />,
      status: 'Best Performance'
    },
    {
      name: 'Coal Miner Detection',
      type: 'Specialized',
      mAP50: 96.48,
      mAP95: 69.57,
      precision: 94.77,
      recall: 91.35,
      f1Score: 93.03,
      inferenceTime: 8.83,
      fps: 113.20,
      modelSize: 21.46,
      classes: 1,
      description: 'Person detection in mining environments',
      icon: <Target className="w-6 h-6" />,
      status: 'Excellent'
    },
    {
      name: 'Hydraulic Support',
      type: 'Specialized',
      mAP50: 94.82,
      mAP95: 73.93,
      precision: 91.13,
      recall: 89.51,
      f1Score: 90.18,
      inferenceTime: 8.18,
      fps: 122.26,
      modelSize: 21.45,
      classes: 9,
      description: 'Multi-class hydraulic equipment analysis',
      icon: <Shield className="w-6 h-6" />,
      status: 'Multi-Class'
    },
    {
      name: 'Mine Safety Helmet',
      type: 'Specialized',
      mAP50: 94.20,
      mAP95: 60.93,
      precision: 90.87,
      recall: 89.19,
      f1Score: 90.03,
      inferenceTime: 7.60,
      fps: 131.63,
      modelSize: 21.46,
      classes: 1,
      description: 'PPE compliance monitoring',
      icon: <Shield className="w-6 h-6" />,
      status: 'Safety Critical'
    },
    {
      name: 'Large Coal Detection',
      type: 'Specialized',
      mAP50: 81.83,
      mAP95: 52.78,
      precision: 76.54,
      recall: 72.81,
      f1Score: 74.63,
      inferenceTime: 7.38,
      fps: 135.59,
      modelSize: 21.45,
      classes: 1,
      description: 'Hazard identification and monitoring',
      icon: <Gauge className="w-6 h-6" />,
      status: 'Good'
    },
    {
      name: 'Miner Behavior Analysis',
      type: 'Specialized',
      mAP50: 79.08,
      mAP95: 59.43,
      precision: 76.48,
      recall: 76.39,
      f1Score: 74.34,
      inferenceTime: 8.63,
      fps: 115.85,
      modelSize: 21.47,
      classes: 8,
      description: 'Behavioral pattern recognition',
      icon: <Activity className="w-6 h-6" />,
      status: 'Multi-Class'
    },
    {
      name: 'General Model',
      type: 'Combined',
      mAP50: 67.32,
      mAP95: 48.97,
      precision: 61.08,
      recall: 68.52,
      f1Score: 63.14,
      inferenceTime: 7.24,
      fps: 138.16,
      modelSize: 64.12,
      classes: 21,
      description: 'All-in-one detection across all categories',
      icon: <Cpu className="w-6 h-6" />,
      status: 'Universal'
    }
  ];

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
        { label: 'mAP@0.5 Range', value: '67-99%' },
        { label: 'mAP@0.5:0.95 Range', value: '49-85%' },
        { label: 'Inference Time', value: '7.2-8.8ms' },
        { label: 'Processing Speed', value: '113-138 FPS' },
        { label: 'Model Count', value: '7 Available' },
        { label: 'Validation Success', value: '100% (7/7 models)' }
      ]
    },
    {
      category: 'Technical Features',
      icon: <Shield className="w-6 h-6" />,
      items: [
        { label: 'Real-time Processing', value: 'Yes' },
        { label: 'Batch Processing', value: 'Yes' },
        { label: 'Video Analysis', value: 'Supported' },
        { label: 'Multi-model Support', value: '7 Available Models' },
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
        { label: 'Model Size', value: '21MB (specialized), 64MB (general)' },
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

        {/* Individual Model Performance Cards */}
        <div className="mt-12">
          <h3 className="text-3xl font-bold text-primary mb-8 text-center">Individual Model Performance</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {modelPerformance.map((model, index) => (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-accent/10 rounded-lg mr-3">
                      {model.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-primary">{model.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        model.status === 'Best Performance' ? 'bg-green-100 text-green-800' :
                        model.status === 'Excellent' ? 'bg-blue-100 text-blue-800' :
                        model.status === 'Safety Critical' ? 'bg-red-100 text-red-800' :
                        model.status === 'Multi-Class' ? 'bg-purple-100 text-purple-800' :
                        model.status === 'Universal' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {model.status}
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    model.type === 'Specialized' ? 'bg-accent/10 text-accent' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {model.type}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">{model.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent mb-1">{model.mAP50.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">mAP@0.5</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent mb-1">{model.mAP95.toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">mAP@0.5:0.95</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precision:</span>
                    <span className="font-semibold">{model.precision.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recall:</span>
                    <span className="font-semibold">{model.recall.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">F1-Score:</span>
                    <span className="font-semibold">{model.f1Score.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inference Time:</span>
                    <span className="font-semibold">{model.inferenceTime.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-semibold">{model.fps.toFixed(0)} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model Size:</span>
                    <span className="font-semibold">{model.modelSize.toFixed(1)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Classes:</span>
                    <span className="font-semibold">{model.classes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-12 bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl p-8">
          <h3 className="text-2xl font-semibold text-primary mb-6 text-center">Validation Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">7/7</div>
              <div className="text-gray-600">Models Validated</div>
              <div className="text-xs text-gray-500 mt-1">100% Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">87.6%</div>
              <div className="text-gray-600">Average mAP@0.5</div>
              <div className="text-xs text-gray-500 mt-1">Across all models</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">8.0ms</div>
              <div className="text-gray-600">Average Inference</div>
              <div className="text-xs text-gray-500 mt-1">Real-time capable</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">192MB</div>
              <div className="text-gray-600">Total Model Size</div>
              <div className="text-xs text-gray-500 mt-1">All 7 models combined</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Specifications;
