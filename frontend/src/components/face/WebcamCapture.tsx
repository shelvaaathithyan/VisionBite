import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Loader2 } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { loadModels, detectFaceWithExpression, getDominantEmotion, startWebcam, stopWebcam } from '../../utils/faceDetection';

interface WebcamCaptureProps {
  onCapture: (descriptor: number[], emotion: string) => void;
  onClose: () => void;
  title: string;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ onCapture, onClose, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [detectedEmotion, setDetectedEmotion] = useState<string>('');
  const [faceDetected, setFaceDetected] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Load face detection models
      await loadModels();
      
      // Start webcam
      if (videoRef.current) {
        const mediaStream = await startWebcam(videoRef.current);
        setStream(mediaStream);
        setIsLoading(false);
        
        // Start face detection loop
        startFaceDetection();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize camera');
      setIsLoading(false);
    }
  };

  const startFaceDetection = () => {
    const detectFrame = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const detection = await detectFaceWithExpression(videoRef.current);
        
        if (detection) {
          setFaceDetected(true);
          const emotion = getDominantEmotion(detection.expressions);
          setDetectedEmotion(emotion);
          
          // Draw detection box
          if (canvasRef.current) {
            const displaySize = {
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
            };
            faceapi.matchDimensions(canvasRef.current, displaySize);
            const resizedDetection = faceapi.resizeResults(detection, displaySize);
            
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              faceapi.draw.drawDetections(canvasRef.current, [resizedDetection]);
            }
          }
        } else {
          setFaceDetected(false);
          setDetectedEmotion('');
        }
      }
      
      animationRef.current = requestAnimationFrame(detectFrame);
    };
    
    detectFrame();
  };

  const handleCapture = async () => {
    if (!videoRef.current || !faceDetected) {
      setError('Please ensure your face is clearly visible');
      return;
    }

    try {
      const detection = await detectFaceWithExpression(videoRef.current);
      
      if (!detection) {
        setError('No face detected. Please try again.');
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      const emotion = getDominantEmotion(detection.expressions);
      
      onCapture(descriptor, emotion);
    } catch (err: any) {
      setError(err.message || 'Failed to capture face');
    }
  };

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    stopWebcam(stream);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative">
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '480px' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-center text-white">
                <Loader2 className="animate-spin mx-auto mb-2" size={40} />
                <p>Loading camera and face detection models...</p>
              </div>
            </div>
          )}

          {detectedEmotion && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <p className="text-sm font-semibold">Detected Mood</p>
              <p className="text-lg capitalize">{detectedEmotion}</p>
            </div>
          )}

          {faceDetected && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm">
              ✓ Face Detected
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleCapture}
            disabled={!faceDetected || isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold ${
              faceDetected && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Camera size={20} />
            Capture Face
          </button>
          <button
            onClick={() => {
              cleanup();
              onClose();
            }}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Position your face in the frame. The system will automatically detect your face and emotion.
        </p>
      </div>
    </div>
  );
};

export default WebcamCapture;
