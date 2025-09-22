import React, { useState } from 'react';
import { Database, Folder, Image, Tag, FileText, BarChart2, Info } from 'lucide-react';

const Dataset = () => {
  const [selectedDataset, setSelectedDataset] = useState('coal_miner');

  const datasets = {
    coal_miner: {
      name: 'Coal Miner Detection',
      folder: 'coal_miner',
      description: 'Dataset for detecting miners and personnel in coal mining environments',
      classes: ['person'],
      images: 61408,
      annotations: 61408,
      splits: { train: 49126, val: 12282 },
      path: '/backend/datasets/coal_miner'
    },
    hydraulic_support: {
      name: 'Hydraulic Support Guard Plate',
      folder: 'hydraulic_support',
      description: 'Detection of hydraulic support systems and structural integrity monitoring',
      classes: ['support_part_1', 'support_part_2', 'support_part_3', 'support_part_4', 'support_part_5', 'support_part_6', 'support_part_7', 'support_part_8', 'support_part_9'],
      images: 40090,
      annotations: 40090,
      splits: { train: 32072, val: 8018 },
      path: '/backend/datasets/hydraulic_support'
    },
    large_coal: {
      name: 'Large Coal Detection',
      folder: 'large_coal',
      description: 'Identification of oversized coal blocks that may damage equipment',
      classes: ['large_coal'],
      images: 42034,
      annotations: 42034,
      splits: { train: 33626, val: 8408 },
      path: '/backend/datasets/large_coal'
    },
    mine_safety_helmet: {
      name: 'Mine Safety Helmet',
      folder: 'mine_safety_helmet',
      description: 'PPE compliance monitoring through safety helmet detection',
      classes: ['helmet'],
      images: 40234,
      annotations: 40234,
      splits: { train: 32186, val: 8048 },
      path: '/backend/datasets/mine_safety_helmet'
    },
    miner_behavior: {
      name: 'Miner Behavior Analysis',
      folder: 'miner_behavior',
      description: 'Behavioral pattern analysis for safety compliance',
      classes: ['behavior_1', 'behavior_2', 'behavior_3', 'behavior_4'],
      images: 49418,
      annotations: 49418,
      splits: { train: 39534, val: 9884 },
      path: '/root/data2023_yolo/miner_behavior_data2023_yolo'
    },
    towline: {
      name: 'Towline Detection',
      folder: 'towline',
      description: 'Monitoring towline conditions and potential obstructions',
      classes: ['towline'],
      images: 42824,
      annotations: 42824,
      splits: { train: 34258, val: 8566 },
      path: '/root/data2023_yolo/towline_data2023_yolo'
    }
  };

  const datasetStructure = `
datasets/
├── general/                    # Combined multi-class dataset (Under Development)
│   ├── data.yaml               # Configuration file
│   ├── images/
│   │   ├── train/              # Training images
│   │   ├── val/                # Validation images
│   │   └── test/               # Test images
│   └── labels/
│       ├── train/              # YOLO format annotations
│       ├── val/                # Validation labels
│       └── test/               # Test labels
│
├── coal_miner/
│   ├── data.yaml
│   ├── images/
│   │   ├── train/
│   │   ├── val/
│   │   └── test/
│   └── labels/
│       ├── train/
│       ├── val/
│       └── test/
│
├── hydraulic_support/
├── large_coal/
├── mine_safety_helmet/
├── miner_behavior/
└── towline/
  `.trim();

  const yoloFormat = `
# YOLO Annotation Format (per line in .txt file)
class_id center_x center_y width height

# Example:
0 0.456 0.234 0.123 0.456   # Miner at center (0.456, 0.234)
1 0.789 0.567 0.234 0.345   # Equipment
2 0.123 0.890 0.456 0.234   # Safety helmet

# Note: All coordinates are normalized (0-1)
  `.trim();

  return (
    <div className="min-h-screen bg-white pt-20">

      {/* Dataset Overview */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="card p-6 text-center">
              <Database className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-2">276,008</h3>
              <p className="text-gray-600">Total Images</p>
            </div>
            <div className="card p-6 text-center">
              <Tag className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-2">276,008</h3>
              <p className="text-gray-600">Annotations</p>
            </div>
            <div className="card p-6 text-center">
              <Folder className="w-12 h-12 text-purple-500 mx-auto mb-3" />
              <h3 className="text-3xl font-bold mb-2">6</h3>
              <p className="text-gray-600">Specialized Datasets</p>
            </div>
          </div>

          {/* Dataset Selector */}
          <h2 className="text-2xl font-bold mb-6">DsLMF Classes</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {Object.entries(datasets).map(([key, dataset]) => (
              <button
                key={key}
                onClick={() => setSelectedDataset(key)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedDataset === key
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <h4 className="font-semibold mb-1">{dataset.name}</h4>
                <p className="text-sm text-gray-600">{dataset.images} images</p>
              </button>
            ))}
          </div>

          {/* Sample Images */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Sample Images</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((sampleNum, idx) => {
                const colors = ['#3B82F6', '#10B981', '#F59E0B'];
                const bgColor = colors[idx];
                
                return (
                  <div key={idx} className="overflow-hidden">
                    <img
                      src={`/samples/${selectedDataset}_${sampleNum}.jpg`}
                      alt={`${datasets[selectedDataset].name} Sample ${sampleNum}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        console.log(`Failed to load: /samples/${selectedDataset}_${sampleNum}.jpg`);
                        // Try alternative extensions
                        const alternatives = [
                          `/samples/${selectedDataset}_${sampleNum}.jpeg`,
                          `/samples/${selectedDataset}_${sampleNum}.JPG`,
                          `/samples/${selectedDataset}_${sampleNum}.png`
                        ];
                        
                        let tried = e.target.dataset.tried ? parseInt(e.target.dataset.tried) : 0;
                        
                        if (tried < alternatives.length) {
                          e.target.dataset.tried = (tried + 1).toString();
                          e.target.src = alternatives[tried];
                          return;
                        }
                        
                        // All alternatives failed, show placeholder
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-48 rounded-lg flex items-center justify-center text-white font-semibold text-lg shadow-lg" style="background-color: ${bgColor}">
                            <div class="text-center">
                              <div class="text-2xl mb-2">📷</div>
                              <div>${datasets[selectedDataset].name}</div>
                              <div class="text-sm opacity-80">Sample ${sampleNum}</div>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Dataset Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="card p-8">
              <h3 className="text-xl font-bold mb-4">{datasets[selectedDataset].name}</h3>
              <p className="text-gray-600 mb-6">{datasets[selectedDataset].description}</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="flex items-center">
                    <Image className="w-5 h-5 mr-2 text-gray-500" />
                    Images
                  </span>
                  <span className="font-bold">{datasets[selectedDataset].images.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="flex items-center">
                    <Tag className="w-5 h-5 mr-2 text-gray-500" />
                    Annotations
                  </span>
                  <span className="font-bold">{datasets[selectedDataset].annotations.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="flex items-center">
                    <Folder className="w-5 h-5 mr-2 text-gray-500" />
                    Folder
                  </span>
                  <span className="font-mono text-sm">{datasets[selectedDataset].folder}</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Classes</h4>
                <div className="flex flex-wrap gap-2">
                  {datasets[selectedDataset].classes.map((cls, idx) => (
                    <span key={idx} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card p-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2" />
                Data Split
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Training Set</span>
                    <span className="text-sm font-bold">{datasets[selectedDataset].splits.train}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                      style={{ width: `${(datasets[selectedDataset].splits.train / datasets[selectedDataset].images) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Validation Set</span>
                    <span className="text-sm font-bold">{datasets[selectedDataset].splits.val}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                      style={{ width: `${(datasets[selectedDataset].splits.val / datasets[selectedDataset].images) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    Data split follows 75-25 train-validation ratio for optimal training
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* YOLO Format */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Annotation Format</h2>
            <div className="card p-8">
              <p className="text-gray-600 mb-4">
                All annotations follow the YOLO format with normalized coordinates:
              </p>
              <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                <pre>{yoloFormat}</pre>
              </div>
            </div>
          </div>

          {/* Dataset Structure - Image Counts Specifications */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Dataset Specifications</h2>
            <div className="card p-8">
              <div className="bg-gray-900 text-gray-100 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                <pre>{datasetStructure}</pre>
              </div>
            </div>
          </div>


          {/* Data Processing Pipeline */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Data Processing Pipeline</h2>
            <div className="card p-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-sm font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Data Collection</h4>
                    <p className="text-gray-600">Raw images and videos collected from actual mining sites with diverse conditions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-sm font-bold text-green-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Annotation</h4>
                    <p className="text-gray-600">Expert-labeled bounding boxes for each object class using specialized annotation tools</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-sm font-bold text-purple-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Preprocessing</h4>
                    <p className="text-gray-600">Image resizing, normalization, and augmentation for improved model training</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-sm font-bold text-orange-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Validation</h4>
                    <p className="text-gray-600">Quality checks to ensure annotation accuracy and data consistency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dataset;