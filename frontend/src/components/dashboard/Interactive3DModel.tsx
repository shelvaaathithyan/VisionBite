import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

interface Interactive3DModelProps {
  modelPath: string;
  userName?: string;
  scale?: number;
}

function AnimatedModel({ modelPath, scale = 1, onLoaded }: { modelPath: string; scale: number; onLoaded: () => void }) {
  const modelRef = useRef<any>();
  const { scene } = useGLTF(modelPath);
  const [waving, setWaving] = useState(false);

  useEffect(() => {
    onLoaded();
    // Trigger wave animation after 1 second
    const timer = setTimeout(() => {
      setWaving(true);
      setTimeout(() => setWaving(false), 2000);
    }, 1000);
    return () => clearTimeout(timer);
  }, [onLoaded]);

  useFrame((_state, delta) => {
    if (modelRef.current) {
      // Gentle idle rotation
      modelRef.current.rotation.y += delta * 0.15;
      
      // Wave animation - slight up and down movement
      if (waving) {
        modelRef.current.position.y = Math.sin(Date.now() * 0.005) * 0.1;
      }
    }
  });

  return <primitive ref={modelRef} object={scene} scale={scale} position={[0, 0, 0]} />;
}

const Interactive3DModel: React.FC<Interactive3DModelProps> = ({ 
  modelPath, 
  userName = 'User',
  scale = 2 
}) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    if (modelLoaded) {
      // Show greeting after model loads
      const timer = setTimeout(() => {
        setShowGreeting(true);
        
        // Hide greeting after 4 seconds
        setTimeout(() => setShowGreeting(false), 4000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [modelLoaded]);

  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 1, 4], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <spotLight position={[-5, 5, 2]} angle={0.3} intensity={0.5} />
          
          {/* 3D Model */}
          <AnimatedModel 
            modelPath={modelPath} 
            scale={scale}
            onLoaded={() => setModelLoaded(true)}
          />
          
          {/* Controls */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>

      {/* Greeting Overlay */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-2xl border-2 border-white/20">
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: [0.5, 1.1, 1] }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-2xl font-bold">👋 Hello, {userName}!</p>
              </motion.div>
            </div>
            
            {/* Speech bubble pointer */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-600"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading indicator */}
      {!modelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-slate-400 text-sm">Loading 3D model...</div>
        </div>
      )}
    </div>
  );
};

export default Interactive3DModel;
