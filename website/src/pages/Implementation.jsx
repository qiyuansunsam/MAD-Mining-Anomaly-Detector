import React, { useState } from 'react';
import { Code, Download, Settings, CheckCircle, AlertTriangle } from 'lucide-react';

const Implementation = () => {
  const [activeTab, setActiveTab] = useState('installation');

  const installationSteps = [
    {
      step: 1,
      title: 'Download Application',
      description: 'Download the latest Windows distribution (581MB)',
      code: 'anomaly-detector-windows-complete.zip',
      status: 'required',
      downloadLink: 'https://github.com/qiyuansunsam/MAD-Mining-Anomaly-Detector/releases/latest/download/anomaly-detector-windows-complete.zip'
    },
    {
      step: 2,
      title: 'Extract Files',
      description: 'Extract ALL files from the ZIP archive',
      code: 'Right-click ZIP → Extract All → Choose destination',
      status: 'required'
    },
    {
      step: 3,
      title: 'Quick Setup',
      description: 'Double-click "windows-setup.bat" for guided setup',
      code: 'windows-setup.bat (recommended for first-time users)',
      status: 'required'
    },
    {
      step: 4,
      title: 'Direct Launch',
      description: 'OR double-click "anomaly-detector.exe" to run directly',
      code: 'anomaly-detector.exe (if Python already installed)',
      status: 'optional'
    },
    {
      step: 5,
      title: 'Python Installation',
      description: 'Install Python 3.9-3.12 if not already installed',
      code: 'Download from python.org and check "Add Python to PATH"',
      status: 'conditional'
    }
  ];

  const systemRequirements = [
    {
      category: 'Operating System',
      requirement: 'Windows 10/11 (64-bit)',
      status: 'required'
    },
    {
      category: 'Python Version',
      requirement: 'Python 3.9, 3.10, 3.11, or 3.12',
      status: 'required'
    },
    {
      category: 'Storage Space',
      requirement: '~1.5GB for application + models',
      status: 'required'
    },
    {
      category: 'Memory',
      requirement: '4GB RAM minimum',
      status: 'recommended'
    },
    {
      category: 'GPU',
      requirement: 'CUDA-compatible (optional for faster inference)',
      status: 'optional'
    }
  ];

  const configOptions = [
    {
      setting: 'confidence_threshold',
      default: '0.5',
      description: 'Minimum confidence score for detections',
      type: 'float (0.0-1.0)'
    },
    {
      setting: 'iou_threshold',
      default: '0.45',
      description: 'IoU threshold for non-maximum suppression',
      type: 'float (0.0-1.0)'
    },
    {
      setting: 'max_detections',
      default: '100',
      description: 'Maximum number of detections per image',
      type: 'integer'
    },
    {
      setting: 'output_format',
      default: 'json',
      description: 'Export format for results',
      type: 'string (json|csv|xml)'
    },
    {
      setting: 'save_images',
      default: 'true',
      description: 'Save annotated images with detections',
      type: 'boolean'
    }
  ];

  const tabs = [
    { id: 'installation', label: 'Installation', icon: <Download className="w-4 h-4" /> },
    { id: 'requirements', label: 'Requirements', icon: <Settings className="w-4 h-4" /> },
    { id: 'configuration', label: 'Configuration', icon: <Code className="w-4 h-4" /> },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  const troubleshootingItems = [
    {
      issue: '"ES Module error" or application won\'t start',
      solutions: [
        'Make sure all files are extracted from ZIP',
        'Try running "windows-setup.bat" as administrator',
        'Restart your computer after installing Python',
        'Check Windows Defender hasn\'t quarantined files'
      ]
    },
    {
      issue: '"Python not found" error',
      solutions: [
        'Install Python from python.org',
        'Make sure "Add Python to PATH" was checked during installation',
        'Open Command Prompt and type "python --version" to verify',
        'Restart the application after installing Python'
      ]
    },
    {
      issue: 'AI detection doesn\'t work',
      solutions: [
        'Open Command Prompt in the application folder',
        'Run: pip install -r backend\\requirements.txt',
        'This installs the required AI packages',
        'Try running as Administrator if packages fail to install'
      ]
    },
    {
      issue: 'Application crashes on startup',
      solutions: [
        'Right-click "anomaly-detector.exe" → "Run as administrator"',
        'Check Windows Defender hasn\'t quarantined files',
        'Ensure no antivirus is blocking the application',
        'Provide error screenshots and console output (F12) for support'
      ]
    },
    {
      issue: 'Python 3.12 installation issues',
      solutions: [
        'Some packages need compilation from source',
        'The setup script will try alternative installation methods',
        'Try running setup as Administrator',
        'Consider using Python 3.10 or 3.11 for easier setup'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-gray-600 hover:text-accent'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {/* Installation Tab */}
          {activeTab === 'installation' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-semibold text-primary mb-6">Quick Start</h3>
                  <div className="space-y-4">
                    {installationSteps.map((step, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                          <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                          {step.downloadLink ? (
                            <a
                              href={step.downloadLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 text-xs bg-accent text-white px-3 py-2 rounded hover:bg-accent/90 transition-colors"
                            >
                              <Download className="w-3 h-3" />
                              <span>{step.code}</span>
                            </a>
                          ) : (
                            <code className="text-xs bg-gray-200 px-2 py-1 rounded">{step.code}</code>
                          )}
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-semibold text-primary mb-6">System Requirements</h3>
                  <div className="card p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Operating System:</span>
                        <span>Windows 10/11 (64-bit)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Python Version:</span>
                        <span>3.9 - 3.12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">RAM:</span>
                        <span>4GB minimum, 8GB recommended</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Storage:</span>
                        <span>1.5GB available space</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">GPU (Optional):</span>
                        <span>CUDA-compatible GPU</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requirements Tab */}
          {activeTab === 'requirements' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-6">System Requirements</h3>
                <div className="card p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4">Category</th>
                          <th className="text-left py-3 px-4">Requirement</th>
                          <th className="text-left py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {systemRequirements.map((req, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-semibold">{req.category}</td>
                            <td className="py-3 px-4">{req.requirement}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                req.status === 'required' ? 'bg-red-100 text-red-800' :
                                req.status === 'recommended' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuration Tab */}
          {activeTab === 'configuration' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-6">Configuration Options</h3>
                <div className="card p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4">Setting</th>
                          <th className="text-left py-3 px-4">Default</th>
                          <th className="text-left py-3 px-4">Type</th>
                          <th className="text-left py-3 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {configOptions.map((option, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 px-4 font-mono text-sm">{option.setting}</td>
                            <td className="py-3 px-4 text-accent font-semibold">{option.default}</td>
                            <td className="py-3 px-4 text-gray-600">{option.type}</td>
                            <td className="py-3 px-4 text-gray-700">{option.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Troubleshooting Tab */}
          {activeTab === 'troubleshooting' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold text-primary mb-6">Common Issues & Solutions</h3>
                <div className="space-y-6">
                  {troubleshootingItems.map((item, index) => (
                    <div key={index} className="card p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                        {item.issue}
                      </h4>
                      <ul className="space-y-2">
                        {item.solutions.map((solution, solutionIndex) => (
                          <li key={solutionIndex} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Implementation;
