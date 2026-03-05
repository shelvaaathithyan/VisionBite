import * as faceapi from 'face-api.js';

let modelsLoaded = false;

export const loadModels = async () => {
  if (modelsLoaded) return;

  const MODEL_URL = '/models';
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    
    modelsLoaded = true;
    console.log('✅ Face detection models loaded');
  } catch (error) {
    console.error('Error loading models:', error);
    throw new Error('Failed to load face detection models');
  }
};

export const detectFaceWithExpression = async (imageElement: HTMLImageElement | HTMLVideoElement) => {
  if (!modelsLoaded) {
    await loadModels();
  }

  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor()
    .withFaceExpressions();

  return detection;
};

export const getDominantEmotion = (expressions: any) => {
  if (!expressions) return 'neutral';

  const emotions = Object.entries(expressions) as [string, number][];
  emotions.sort((a, b) => b[1] - a[1]);
  
  return emotions[0][0];
};

export const startWebcam = async (videoElement: HTMLVideoElement): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: false,
    });
    
    videoElement.srcObject = stream;
    
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve(stream);
      };
    });
  } catch (error) {
    console.error('Error accessing webcam:', error);
    throw new Error('Cannot access webcam. Please ensure camera permissions are granted.');
  }
};

export const stopWebcam = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

export const captureFrameFromVideo = (video: HTMLVideoElement): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.drawImage(video, 0, 0);
  }
  
  return canvas;
};
