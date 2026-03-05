import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';

interface Model3DProps {
  modelPath: string;
  autoRotate?: boolean;
  scale?: number;
}

function Model({ modelPath, scale = 1 }: { modelPath: string; scale: number }) {
  const modelRef = useRef<any>();
  const { scene } = useGLTF(modelPath);

  // Auto-rotate the model
  useFrame((_state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.3;
    }
  });

  return <primitive ref={modelRef} object={scene} scale={scale} />;
}

const Model3DViewer: React.FC<Model3DProps> = ({ 
  modelPath, 
  autoRotate = true,
  scale = 1.5 
}) => {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          {/* 3D Model */}
          <Model modelPath={modelPath} scale={scale} />
          
          {/* Environment for better lighting */}
          <Environment preset="sunset" />
          
          {/* Controls */}
          {autoRotate && <OrbitControls enableZoom={false} enablePan={false} />}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Model3DViewer;
