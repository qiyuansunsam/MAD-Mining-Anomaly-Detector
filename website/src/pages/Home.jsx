import React, { useState, useEffect, useRef } from 'react';
import { Download, Mail, Github, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [screenshots, setScreenshots] = useState([]);
  const videoRef = useRef(null);

  // Media items - demo video plus screenshots
  const mediaItems = [
    { type: 'video', src: '/demo-video.mp4', title: 'Demo Video' },
    { type: 'image', src: '/screenshots/Screenshot 2025-09-22 092407.png', title: 'Screenshot 1' },
    { type: 'image', src: '/screenshots/Screenshot 2025-09-22 092433.png', title: 'Screenshot 2' },
    { type: 'image', src: '/screenshots/Screenshot 2025-09-22 092512.png', title: 'Screenshot 3' },
    { type: 'image', src: '/screenshots/Screenshot 2025-09-22 092519.png', title: 'Screenshot 4' },
    { type: 'image', src: '/screenshots/Screenshot 2025-09-22 092706.png', title: 'Screenshot 5' },
  ];

  useEffect(() => {
    // Set media items
    setScreenshots(mediaItems);
  }, []);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? screenshots.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === screenshots.length - 1 ? 0 : prev + 1));
  };

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const getVisibleMedia = () => {
    if (screenshots.length === 0) return [];
    
    const prevIndex = currentImageIndex === 0 ? screenshots.length - 1 : currentImageIndex - 1;
    const nextIndex = currentImageIndex === screenshots.length - 1 ? 0 : currentImageIndex + 1;
    
    return [
      { ...screenshots[prevIndex], position: 'left', index: prevIndex },
      { ...screenshots[currentImageIndex], position: 'center', index: currentImageIndex },
      { ...screenshots[nextIndex], position: 'right', index: nextIndex }
    ];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Video Gallery */}
      <section className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Three Media Display */}
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div className="relative w-full max-w-7xl mx-auto px-4">
            {getVisibleMedia().map((media, index) => (
              <div
                key={`${media.index}-${media.position}`}
                className={`absolute transition-all duration-700 ease-in-out cursor-pointer ${
                  media.position === 'center'
                    ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] z-10 opacity-100'
                    : media.position === 'left'
                    ? 'left-16 top-1/2 -translate-y-1/2 w-80 h-56 z-5 opacity-60 -rotate-6 hover:opacity-80'
                    : 'right-16 top-1/2 -translate-y-1/2 w-80 h-56 z-5 opacity-60 rotate-6 hover:opacity-80'
                }`}
                onClick={() => {
                  if (media.position !== 'center') {
                    setCurrentImageIndex(media.index);
                  }
                }}
              >
                {media.type === 'video' ? (
                  <video
                    ref={media.position === 'center' ? videoRef : null}
                    className={`w-full h-full object-cover rounded-xl shadow-2xl transition-all duration-300 ${
                      media.position === 'center' ? 'filter-none' : 'filter blur-[1px] hover:blur-none'
                    }`}
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    <source src={media.src} type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src={media.src}
                    alt={media.title}
                    className={`w-full h-full object-cover rounded-xl shadow-2xl transition-all duration-300 ${
                      media.position === 'center' ? 'filter-none' : 'filter blur-[1px] hover:blur-none'
                    }`}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/800x600/f3f4f6/6b7280?text=${media.title}`;
                    }}
                  />
                )}
                {media.position === 'center' && media.type === 'video' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideo();
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                          {isVideoPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white" />}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMute();
                          }}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                        </button>
                        <span className="text-white text-sm font-medium">Mining Safety Detection Demo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevImage}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={handleNextImage}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 p-4 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Bottom Content */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-15 text-center">
          <div className="animate-fade-in">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/qiyuansunsam/MAD-Mining-Anomaly-Detector-/raw/main/mad-app/dist/anomaly-detector-windows-complete.zip"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download Latest Release</span>
              </a>
              <a
                href="https://github.com/qiyuansunsam/MAD-Mining-Anomaly-Detector-"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center space-x-2"
              >
                <Github className="w-5 h-5" />
                <span>View on GitHub</span>
              </a>
              <a
                href="mailto:qiyuansunsam@gmail.com"
                className="btn-secondary flex items-center space-x-2"
              >
                <Mail className="w-5 h-5" />
                <span>Contact</span>
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mining Anomaly Detection - Intelligent Safety Monitoring System
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">High Accuracy Detection</h3>
              <p className="text-gray-600">84-90% mAP@0.5 across specialized models with 125ms inference time for real-time performance</p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Large-scale Training</h3>
              <p className="text-gray-600">91,883 annotated images across multiple mining datasets with YOLOv8 architecture</p>
            </div>
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-domain Detection</h3>
              <p className="text-gray-600">Personnel, safety equipment, machinery, and behavior analysis with specialized models for each domain</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
