import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfigProvider, theme, Button, Card, Spin, Progress, message, Switch } from 'antd';
import { CloudUploadOutlined, RocketOutlined, SafetyCertificateOutlined, DownloadOutlined, ReloadOutlined, VideoCameraOutlined, PlayCircleOutlined } from '@ant-design/icons';
import axios, { AxiosError } from 'axios';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import './App.css';


interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
}

interface DetectionResult {
  image: string;
  detections: Detection[];
  processTime: number;
}

interface ModelInfo {
  id: string;
  name: string;
  color: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const MODELS: ModelInfo[] = [
  { id: 'general', name: 'General Detection (All)', color: '#9B59B6' },
  { id: 'mine_safety_helmet', name: 'Safety Helmet Detection', color: '#E74C3C' },
  { id: 'coal_miner', name: 'Coal Miner Safety', color: '#8B4513' },
  { id: 'hydraulic_support', name: 'Hydraulic Support Guard', color: '#4A90E2' },
  { id: 'large_coal', name: 'Large Coal Detection', color: '#2C3E50' },
  { id: 'miner_behavior', name: 'Miner Behavior Analysis', color: '#F39C12' },
  { id: 'towline', name: 'Towline Monitoring', color: '#27AE60' }
];

function App() {
  const [selectedModel, setSelectedModel] = useState<string>('mine_safety_helmet');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ffmpegRef = useRef<FFmpeg>();
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  useEffect(() => {
    checkServerConnection();
    loadFFmpeg();
    checkVideoSupport();
  }, []);

  const checkVideoSupport = () => {
    const video = document.createElement('video');
    const formats = [
      'video/mp4',
      'video/mp4; codecs="avc1.42E01E"',
      'video/mp4; codecs="mp4v.20.8"',
      'video/webm'
    ];
    
    console.log('Browser Video Support:');
    formats.forEach(format => {
      const support = video.canPlayType(format);
      console.log(`${format}: ${support || 'no'}`);
    });
    
    console.log('User Agent:', navigator.userAgent);
  };

  const loadFFmpeg = async () => {
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;
      
      ffmpeg.on('log', ({ message }) => {
        console.log('FFmpeg:', message);
      });
      
      ffmpeg.on('progress', ({ progress }) => {
        console.log('FFmpeg progress:', progress);
      });
      
      // Use a simpler, more reliable CDN
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      
      setFfmpegLoaded(true);
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      setFfmpegLoaded(false);
    }
  };

  const checkServerConnection = async () => {
    try {
      await axios.get(`${API_URL}/health`);
    } catch (error) {
      console.log('Detection server not connected');
    }
  };

  const handleImageUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      message.error('Please upload a valid image file');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      message.error('Image size must be less than 10MB');
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        setUploadedImage(e.target.result as string);
        setResultImage(null);
        setDetectionResult(null);
      }
    };
    reader.onerror = () => {
      message.error('Failed to read the image file');
    };
    reader.readAsDataURL(file);
    return false; // Prevent upload
  }, []);

  const handleVideoUpload = useCallback((file: File) => {
    console.log('Video upload attempted:', file.name, file.type, file.size);
    
    // Allow MP4 and WebM files
    if (file.type !== 'video/mp4' && file.type !== 'video/webm') {
      message.error('Please upload an MP4 or WebM video file');
      return false;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
      message.error('Video size must be less than 50MB');
      return false;
    }

    // Create object URL instead of data URL for better performance
    const videoUrl = URL.createObjectURL(file);
    console.log('Video object URL created:', videoUrl);
    
    setUploadedVideo(videoUrl);
    setProcessedVideo(null);
    setDetectionResult(null);
    
    return false; // Prevent upload
  }, []);

  const processImage = async () => {
    if (!uploadedImage) {
      message.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(20);
      const formData = new FormData();
      const response = await fetch(uploadedImage);
      if (!response.ok) {
        throw new Error('Failed to process uploaded image');
      }
      
      setProgress(40);
      const blob = await response.blob();
      formData.append('file', blob, 'image.jpg');
      formData.append('model', selectedModel);

      setProgress(60);
      const detectionResponse = await axios.post(`${API_URL}/detect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // 30 second timeout
      });

      setProgress(100);

      if (detectionResponse.data && detectionResponse.data.image) {
        setDetectionResult(detectionResponse.data);
        setResultImage(detectionResponse.data.image);
      } else {
        throw new Error('Invalid response from detection server');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.code === 'ECONNABORTED') {
          message.error('Detection timed out. Please try again.');
        } else if (axiosError.response?.status === 404) {
          message.error('Detection endpoint not found. Please check server configuration.');
        } else if (axiosError.response?.status && axiosError.response.status >= 500) {
          message.error('Server error occurred. Please try again later.');
        } else {
          message.error('Detection failed. Please check the server connection.');
        }
      } else {
        message.error('An unexpected error occurred during detection.');
      }
      
      console.error('Detection error:', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadResult = async () => {
    if (!resultImage) {
      message.error('No result image to download');
      return;
    }

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `detection_result_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      message.error('Failed to download result image');
    }
  };

  const extractFramesFromVideo = async (videoFile: string, fps: number = 6): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      console.log('Starting frame extraction...');
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const frames: string[] = [];
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Set timeout to prevent hanging
      const timeoutId = setTimeout(() => {
        reject(new Error('Video loading timeout'));
      }, 10000);
      
      video.onloadedmetadata = () => {
        clearTimeout(timeoutId);
        console.log('Video metadata loaded:', {
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight
        });
        
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          reject(new Error('Invalid video dimensions'));
          return;
        }
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const duration = video.duration;
        const frameInterval = 1 / fps;
        let currentTime = 0;
        // Calculate total frames properly: include frames up to the very end
        const totalFrames = Math.ceil(duration * fps);
        console.log(`Video duration: ${duration}s, will extract ${totalFrames} frames at ${fps} FPS (every ${frameInterval.toFixed(3)}s)`);
        
        const captureFrame = () => {
          // Stop when we have all frames or current time exceeds video duration
          if (frames.length >= totalFrames || currentTime > duration) {
            console.log(`Frame extraction complete. Extracted ${frames.length} frames for ${duration}s video.`);
            console.log(`Expected duration: ${duration}s, Output duration: ${(frames.length / fps).toFixed(2)}s`);
            resolve(frames);
            return;
          }
          
          // Ensure we don't seek beyond video duration
          video.currentTime = Math.min(currentTime, duration - 0.001);
        };
        
        video.onseeked = () => {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameData = canvas.toDataURL('image/jpeg', 0.8);
            frames.push(frameData);
            console.log(`Captured frame ${frames.length}/${totalFrames} at time ${currentTime.toFixed(3)}s (actual: ${video.currentTime.toFixed(3)}s)`);
            
            currentTime += frameInterval;
            
            // Use setTimeout to prevent stack overflow
            setTimeout(captureFrame, 50);
          } catch (error) {
            console.error('Error capturing frame:', error);
            currentTime += frameInterval;
            setTimeout(captureFrame, 50);
          }
        };
        
        // Start frame capture
        captureFrame();
      };
      
      video.onerror = (error) => {
        clearTimeout(timeoutId);
        console.error('Video load error:', error);
        reject(new Error('Failed to load MP4 video for frame extraction'));
      };
      
      video.oncanplay = () => {
        console.log('Video can play');
      };
      
      // Set video properties - remove crossOrigin as it might cause issues with blob URLs
      video.preload = 'metadata';
      video.muted = true; // Add muted to help with autoplay policies
      video.src = videoFile;
      
      console.log('Video src set, waiting for metadata...');
    });
  };

  const processVideo = async () => {
    if (!uploadedVideo) {
      message.error('Please upload a video first');
      return;
    }

    console.log('Starting video processing...');
    setIsProcessing(true);
    setProgress(0);

    try {

      setProgress(10);
      
      console.log('Extracting frames from video with length:', uploadedVideo.length);
      const frames = await extractFramesFromVideo(uploadedVideo, 6);
      console.log(`Extracted ${frames.length} frames`);
      
      // Log timing details for debugging
      const originalDuration = videoRef.current?.duration || 0;
      const extractedDuration = frames.length / 6;
      console.log(`Original video duration: ${originalDuration.toFixed(2)}s`);
      console.log(`Extracted frames duration: ${extractedDuration.toFixed(2)}s`);
      console.log(`Duration difference: ${Math.abs(originalDuration - extractedDuration).toFixed(2)}s`);
      
      if (frames.length === 0) {
        throw new Error('No frames could be extracted from the video');
      }
      
      setProgress(20);

      const processedFrames: string[] = [];
      const totalFrames = frames.length; // Process all extracted frames to maintain video duration
      
      for (let i = 0; i < totalFrames; i++) {
        try {
          const formData = new FormData();
          const response = await fetch(frames[i]);
          if (!response.ok) {
            throw new Error(`Failed to fetch frame ${i}`);
          }
          const blob = await response.blob();
          formData.append('file', blob, `frame_${i}.jpg`);
          formData.append('model', selectedModel);

          console.log(`Processing frame ${i+1}/${totalFrames}`);
          const detectionResponse = await axios.post(`${API_URL}/detect`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 15000,
          });

          if (detectionResponse.data && detectionResponse.data.image) {
            processedFrames.push(detectionResponse.data.image);
            console.log(`Frame ${i+1} processed successfully`);
          } else {
            console.warn(`Frame ${i+1} processing returned no image, using original`);
            processedFrames.push(frames[i]);
          }
        } catch (error) {
          console.warn(`Failed to process frame ${i+1}:`, error);
          processedFrames.push(frames[i]); // Use original frame if detection fails
        }

        const progressPercent = 20 + ((i + 1) / totalFrames) * 70;
        setProgress(Math.round(progressPercent));
      }

      console.log(`Processing complete. ${processedFrames.length} frames processed.`);
      setProgress(95);
      
      // Create video from processed frames
      console.log('Creating video from processed frames...');
      const processedVideoBlob = await createVideoFromFrames(processedFrames, 6);
      console.log('Video created, blob size:', processedVideoBlob.size);
      
      const processedVideoUrl = URL.createObjectURL(processedVideoBlob);
      setProcessedVideo(processedVideoUrl);
      
      // Log final video details for verification
      const expectedDuration = processedFrames.length / 6;
      console.log(`Final processed video created:`);
      console.log(`- Processed frames: ${processedFrames.length}`);
      console.log(`- Expected duration: ${expectedDuration.toFixed(2)}s`);
      console.log(`- Blob size: ${(processedVideoBlob.size / 1024 / 1024).toFixed(2)}MB`);
      
      setProgress(100);
      
      // Auto-play both videos after processing
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          videoRef.current.play().catch(console.error);
        }
        const processedVideoElement = document.getElementById('processed-video') as HTMLVideoElement;
        if (processedVideoElement) {
          processedVideoElement.currentTime = 0;
          processedVideoElement.play().catch(console.error);
        }
      }, 500);
      
    } catch (error) {
      console.error('Video processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Failed to process video: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const createVideoFromFrames = async (frames: string[], fps: number): Promise<Blob> => {
    console.log(`Creating video from ${frames.length} frames at ${fps} FPS`);
    
    // For now, use the Canvas + MediaRecorder method as it's more reliable
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      
      console.log('Loading first frame to get dimensions...');
      // Load first frame to get dimensions
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        console.log(`Canvas dimensions set to ${img.width}x${img.height}`);
        
        // Check MediaRecorder support - prefer WebM for better compatibility
        const supportedTypes = [
          'video/webm;codecs=vp9',
          'video/webm;codecs=vp8', 
          'video/webm',
          'video/mp4;codecs=avc1',
          'video/mp4'
        ];
        
        let selectedType = 'video/webm';
        for (const type of supportedTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            selectedType = type;
            console.log(`Using MediaRecorder type: ${type}`);
            break;
          }
        }
        
        if (!MediaRecorder.isTypeSupported(selectedType)) {
          console.warn('No supported video types found, using default webm');
          selectedType = 'video/webm';
        }
        
        const stream = canvas.captureStream(fps);
        const recorder = new MediaRecorder(stream, {
          mimeType: selectedType,
          videoBitsPerSecond: 1000000 // 1 Mbps for better quality
        });
        
        const chunks: Blob[] = [];
        
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
            console.log(`Recorded chunk: ${event.data.size} bytes`);
          }
        };
        
        recorder.onstop = () => {
          console.log(`Recording stopped. Total chunks: ${chunks.length}`);
          const blob = new Blob(chunks, { type: selectedType });
          console.log(`Final video blob size: ${blob.size} bytes`);
          resolve(blob);
        };
        
        recorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          reject(new Error('MediaRecorder failed'));
        };
        
        recorder.start(50); // Record in smaller 50ms chunks for better frame capture
        console.log('MediaRecorder started');
        
        // Draw frames sequentially at exact FPS timing
        let frameIndex = 0;
        const frameInterval = 1000 / fps; // ms per frame
        const expectedDuration = (frames.length / fps) * 1000; // Total video duration in ms
        console.log(`Creating video: ${frames.length} frames at ${fps} FPS`);
        console.log(`Frame interval: ${frameInterval}ms, Expected duration: ${expectedDuration}ms`);
        
        const drawFrame = () => {
          if (frameIndex >= frames.length) {
            console.log(`All ${frames.length} frames drawn, waiting before stopping recorder...`);
            // Wait extra time to ensure last frame is captured properly
            const finalDelay = Math.max(frameInterval * 3, 500); // At least 500ms or 3 frame intervals
            setTimeout(() => {
              console.log('Stopping recorder after final frame delay');
              recorder.stop();
            }, finalDelay);
            return;
          }
          
          const frameImg = new Image();
          frameImg.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
            const timestamp = (frameIndex / fps).toFixed(3);
            console.log(`Drew frame ${frameIndex + 1}/${frames.length} at timestamp ${timestamp}s`);
            frameIndex++;
            
            // Continue to next frame with precise timing
            setTimeout(drawFrame, frameInterval);
          };
          
          frameImg.onerror = () => {
            console.error(`Failed to load frame ${frameIndex}`);
            frameIndex++;
            setTimeout(drawFrame, frameInterval);
          };
          
          frameImg.src = frames[frameIndex];
        };
        
        // Start drawing frames immediately
        drawFrame();
      };
      
      img.onerror = () => {
        console.error('Failed to load first frame for video creation');
        reject(new Error('Failed to load first frame'));
      };
      
      img.src = frames[0];
    });
  };

  const resetApp = useCallback(() => {
    // Clean up blob URLs to prevent memory leaks
    if (uploadedVideo && uploadedVideo.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedVideo);
    }
    if (processedVideo && processedVideo.startsWith('blob:')) {
      URL.revokeObjectURL(processedVideo);
    }
    
    setUploadedImage(null);
    setUploadedVideo(null);
    setResultImage(null);
    setProcessedVideo(null);
    setDetectionResult(null);
    setProgress(0);
  }, [uploadedVideo, processedVideo]);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 12,
          fontSize: 14,
        },
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-slate-200 to-gray-300 flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1
          }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white/90 backdrop-blur-md border-r border-gray-300 shadow-lg flex flex-col w-80"
        >
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-300">
            <div className="flex justify-between items-start">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h2 className="text-xl font-bold text-gray-800">MAD System</h2>
                <p className="text-sm text-gray-600">Mining Anomaly Detection</p>
              </motion.div>
              
              {/* Video Mode Toggle */}
              <div 
                className="flex items-center bg-white border-2 border-gray-300 rounded-full p-1 cursor-pointer hover:border-gray-400 transition-all duration-200"
                onClick={() => {
                  setIsVideoMode(!isVideoMode);
                  resetApp();
                }}
              >
                <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  !isVideoMode 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}>
                  Image
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  isVideoMode 
                    ? 'bg-gray-800 text-white shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}>
                  Video
                </div>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="flex-1 p-4 sidebar-scrollbar overflow-y-auto">
            
            <div className="space-y-2">
              {MODELS.map((model) => (
                <motion.div
                  key={model.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedModel(model.id)}
                  className={`
                    sidebar-model-item cursor-pointer p-4 rounded-xl border transition-all duration-300
                    ${selectedModel === model.id 
                      ? 'active-model-glow bg-gradient-to-r from-slate-300/50 to-gray-300/50 border-slate-400 shadow-lg shadow-slate-400/25' 
                      : 'bg-white/60 border-gray-300 hover:border-gray-400 hover:bg-gray-100/60'
                    }
                  `}
                >
                  <div className="flex-1">
                    <h4 className="text-gray-800 font-medium text-sm">{model.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: selectedModel === model.id ? '#F97316' : '#10B981' 
                        }}
                      />
                      <span className="text-xs text-gray-600">
                        {selectedModel === model.id ? 'Active' : 'Available'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8"
          >

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                title={<span style={{ color: 'black' }}>{isVideoMode ? 'Input Video' : 'Input Image'}</span>}
                className="h-full bg-white/80 backdrop-blur-md border-gray-300 shadow-lg"
                extra={
                  (uploadedImage || uploadedVideo) && (
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={resetApp}
                      type="text"
                      style={{ color: 'black' }}
                    >
                      Reset
                    </Button>
                  )
                }
              >
                {isVideoMode ? (
                  // Video Upload
                  !uploadedVideo ? (
                    <div
                      onClick={() => document.getElementById('video-input')?.click()}
                      className="bg-white border-2 border-dashed border-black hover:border-gray-700 transition-all duration-300 cursor-pointer rounded-xl"
                      style={{ minHeight: '400px' }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-gray-700');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-gray-700');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-gray-700');
                        const files = e.dataTransfer.files;
                        if (files[0]) {
                          handleVideoUpload(files[0]);
                        }
                      }}
                    >
                      <input
                        id="video-input"
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleVideoUpload(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <motion.div
                        className="p-8"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <VideoCameraOutlined className="text-6xl text-black mb-4" />
                        <p className="text-xl text-black mb-2">Click or drag video to upload</p>
                        <p className="text-gray-600">Support for MP4 and WebM formats</p>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="relative">
                      <video 
                        ref={videoRef}
                        src={uploadedVideo || undefined} 
                        controls
                        loop
                        preload="metadata"
                        muted
                        playsInline
                        className="w-full rounded-lg shadow-2xl"
                        style={{ maxHeight: '500px' }}
                        onError={(e) => {
                          console.error('Video playback error:', e, e.currentTarget.error);
                          message.error('Video playback failed. Please try a different video.');
                        }}
                        onLoadedData={() => {
                          console.log('Video loaded successfully for playback');
                        }}
                        onLoadedMetadata={() => {
                          if (videoRef.current) {
                            const video = videoRef.current;
                            console.log('Video metadata loaded:', {
                              duration: video.duration,
                              width: video.videoWidth,
                              height: video.videoHeight
                            });
                          }
                        }}
                        onCanPlay={() => {
                          console.log('Video can play');
                        }}
                      />
                    </div>
                  )
                ) : (
                  // Image Upload (existing code)
                  !uploadedImage ? (
                    <div
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="bg-white border-2 border-dashed border-black hover:border-gray-700 transition-all duration-300 cursor-pointer rounded-xl"
                      style={{ minHeight: '400px' }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-gray-700');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-gray-700');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-gray-700');
                        const files = e.dataTransfer.files;
                        if (files[0]) {
                          handleImageUpload(files[0]);
                        }
                      }}
                    >
                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <motion.div
                        className="p-8"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <CloudUploadOutlined className="text-6xl text-black mb-4" />
                        <p className="text-xl text-black mb-2">Click or drag image to upload</p>
                        <p className="text-gray-600">Support for JPG, PNG, BMP formats</p>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        className="w-full rounded-lg shadow-2xl"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                      />
                    </div>
                  )
                )}

                {/* Start Detection Button - Always present */}
                <motion.div 
                  className="mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={isVideoMode ? <PlayCircleOutlined /> : <RocketOutlined />}
                    onClick={isVideoMode ? processVideo : processImage}
                    disabled={(!uploadedImage && !uploadedVideo) || isProcessing}
                    className="w-full h-12 text-lg font-semibold"
                    style={{
                      background: (!uploadedImage && !uploadedVideo) || isProcessing 
                        ? '#374151' 
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      opacity: (!uploadedImage && !uploadedVideo) || isProcessing ? 0.5 : 1,
                    }}
                  >
                    {isProcessing ? 'Processing...' : isVideoMode ? 'Start Video Processing' : 'Start Detection'}
                  </Button>
                </motion.div>

                {isProcessing && (
                  <div className="mt-4">
                    <Progress 
                      percent={progress} 
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      status="active"
                    />
                    <div className="text-center mt-2">
                      <Spin size="small" />
                      <span className="ml-2 text-gray-600">
                        {isVideoMode ? 'Processing video...' : 'Processing image...'}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Results Area */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card 
                title={<span style={{ color: 'black' }}>Detection Results</span>}
                className="h-full bg-white/80 backdrop-blur-md border-gray-300 shadow-lg"
                extra={
                  (resultImage || processedVideo) && (
                    <Button 
                      icon={<DownloadOutlined />} 
                      onClick={downloadResult}
                      type="primary"
                    >
                      Download
                    </Button>
                  )
                }
              >
                {isVideoMode ? (
                  // Video Results - Only show processed video
                  processedVideo ? (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="space-y-4"
                      >
                        {/* Single processed video display */}
                        <div>
                          <video 
                            id="processed-video"
                            src={processedVideo || undefined} 
                            controls
                            loop
                            preload="metadata"
                            muted
                            playsInline
                            className="w-full rounded-lg shadow-lg"
                            style={{ maxHeight: '500px' }}
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-600">
                      <VideoCameraOutlined className="text-6xl mb-4 text-gray-500" />
                      <p className="text-lg">No video results yet</p>
                      <p className="text-sm mt-2">Upload a video and run processing</p>
                    </div>
                  )
                ) : (
                  // Image Results (existing code)
                  resultImage ? (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <img 
                          src={resultImage} 
                          alt="Detection Result" 
                          className="w-full rounded-lg shadow-2xl"
                          style={{ maxHeight: '500px', objectFit: 'contain' }}
                        />
                        
                        {detectionResult && (
                          <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-gray-700">Detections Found:</span>
                              <span className="text-2xl font-bold text-gray-800">
                                {detectionResult.detections?.length || 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Processing Time:</span>
                              <span className="text-lg font-semibold text-gray-800">
                                {(detectionResult.processTime || 0).toFixed(2)}ms
                              </span>
                            </div>
                            
                            {detectionResult.detections && detectionResult.detections.length > 0 && (
                              <div className="mt-4">
                                <p className="text-gray-600 text-sm mb-2">Detection Details:</p>
                                <div className="max-h-40 overflow-y-auto">
                                  {detectionResult.detections.map((det, idx) => (
                                    <div key={`detection-${idx}`} className="bg-white border border-gray-200 p-2 rounded mb-1">
                                      <span className="text-gray-800 font-medium">{det.class || 'Unknown'}</span>
                                      <span className="text-gray-600 ml-2">
                                        Confidence: {((det.confidence || 0) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-600">
                      <SafetyCertificateOutlined className="text-6xl mb-4 text-gray-500" />
                      <p className="text-lg">No detection results yet</p>
                      <p className="text-sm mt-2">Upload an image and run detection</p>
                    </div>
                  )
                )}
              </Card>
            </motion.div>
          </div>

            {/* Specifications */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="bg-white/80 backdrop-blur-md border-gray-300 shadow-lg">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Specifications</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Dataset Specifications */}
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                      <h4 className="text-gray-800 font-medium mb-2">Dataset Size</h4>
                      <p className="text-gray-700 text-sm">10,000+ annotated images</p>
                      <p className="text-gray-600 text-xs">High-resolution mining environment captures</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                      <h4 className="text-gray-800 font-medium mb-2">Detection Classes</h4>
                      <p className="text-gray-700 text-sm">6 specialized categories</p>
                      <p className="text-gray-600 text-xs">Mining equipment, safety gear, behavior analysis</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                      <h4 className="text-gray-800 font-medium mb-2">Environment</h4>
                      <p className="text-gray-700 text-sm">Underground longwall mining</p>
                      <p className="text-gray-600 text-xs">Real-world mining face conditions</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                      <h4 className="text-gray-800 font-medium mb-2">Model Architecture</h4>
                      <p className="text-gray-700 text-sm">YOLOv8 Object Detection</p>
                      <p className="text-gray-600 text-xs">Real-time inference capability</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                      <h4 className="text-gray-800 font-medium mb-2">Accuracy</h4>
                      <p className="text-gray-700 text-sm">mAP50: 85.2%</p>
                      <p className="text-gray-600 text-xs">Validated on test dataset</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg shadow-sm">
                      <h4 className="text-gray-800 font-medium mb-2">Use Cases</h4>
                      <p className="text-gray-700 text-sm">Safety monitoring</p>
                      <p className="text-gray-600 text-xs">Anomaly detection, compliance checking</p>
                    </div>
                  </div>

                  {/* Dataset Link */}
                  <div className="text-center pt-4 border-t border-gray-300">
                    <p className="text-gray-600 text-sm mb-3">
                      DsLMF - Underground Longwall Mining Face Dataset
                    </p>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => window.open('https://springernature.figshare.com/collections/DsLMF_An_open_dataset_for_intelligent_recognition_of_abnormal_condition_in_underground_longwall_mining_face/6307599', '_blank')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 border-none"
                    >
                      View Original Dataset →
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;