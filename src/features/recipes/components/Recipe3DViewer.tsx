import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Html, OrbitControls, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import * as THREE from "three";

interface Recipe3DViewerProps {
  modelUrl: string;
}

const Model = ({ url, exploded }: { url: string; exploded: boolean }) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  // Clonar la escena para no modificar la caché global si se reusa
  const clonedScene = scene.clone();

  // Guardar posiciones originales si es la primera vez
  // Pero como los GLB varían, una estrategia simple de "explosión" es mover los hijos
  // lejos del centro basándose en su vector de posición original.

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child) => {
        // Aseguramos que el objeto tiene una "posición original" guardada en userdata
        if (!child.userData.originalPos) {
          child.userData.originalPos = child.position.clone();
          // Si la posición es 0,0,0 (común en imports), asignamos una dirección aleatoria o basada en bounding box
          // Para este demo, asumiremos que las mallas tienen offsets. Si no, explotarán esféricamente.
          if (child.position.length() < 0.01) {
            const randomDir = new THREE.Vector3(Math.random() - 0.5, Math.random(), Math.random() - 0.5).normalize();
            child.userData.explodeDir = randomDir;
          } else {
            child.userData.explodeDir = child.position.clone().normalize();
          }
        }

        const targetPos = exploded
          ? child.userData.originalPos.clone().add(child.userData.explodeDir.clone().multiplyScalar(2)) // Expansión
          : child.userData.originalPos;

        child.position.lerp(targetPos, delta * 2); // Animación suave
      });

      // Rotación suave automática si no está explotado
      if (!exploded) {
        groupRef.current.rotation.y += delta * 0.1;
      }
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={clonedScene} />
      {exploded && (
        <Html position={[0, 1.5, 0]} center className="pointer-events-none">
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
            Ingredientes Visibles
          </div>
        </Html>
      )}
    </group>
  );
};

export default function Recipe3DViewer({ modelUrl }: Recipe3DViewerProps) {
  const [exploded, setExploded] = useState(false);

  // Fallback si no hay URL
  if (!modelUrl) return null;

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-gray-50 to-gray-200 rounded-lg overflow-hidden border shadow-inner">
      <Canvas camera={{ position: [3, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Environment preset="city" />
        <Model url={modelUrl} exploded={exploded} />
        <OrbitControls autoRotate={!exploded} autoRotateSpeed={2} />
      </Canvas>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setExploded(!exploded)}
          className="bg-white/90 hover:bg-white shadow-lg backdrop-blur"
        >
          {exploded ? (
            <><Minimize2 className="w-4 h-4 mr-2" /> Unir</>
          ) : (
            <><Maximize2 className="w-4 h-4 mr-2" /> Desintegrar</>
          )}
        </Button>
      </div>

      <div className="absolute top-4 left-4 bg-white/80 p-2 rounded backdrop-blur text-xs font-mono text-gray-500">
        Interactivo 3D
      </div>
    </div>
  );
}
