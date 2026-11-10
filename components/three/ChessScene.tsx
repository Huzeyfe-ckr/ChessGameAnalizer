"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, useGLTF } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

const MODEL_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/models/chess-set.glb`;

/** Noms des pièces dans le fichier chess-set.glb. */
const PIECES = {
  whiteKing: ["White_chess_side001"],
  whiteQueen: ["Plane001"],
  whitePawn: ["White_chess_side"],
  whiteBishop: ["White_chess_side003"],
  whiteKnight: ["pPlane13"],
  whiteRook: ["White_chess_side011"],
  blackKing: [
    "Black_chess_side001",
    "Black_chess_side002",
    "Black_chess_side003",
    "Black_chess_side004",
    "Black_chess_side005",
    "Black_chess_side006",
  ],
  blackQueen: ["Plane002"],
  blackPawn: ["Black_chess_side"],
  blackBishop: ["White_chess_side013"],
  blackKnight: ["pPlane13003"],
  blackRook: ["Black_chess_side014"],
} as const;

type PieceName = keyof typeof PIECES;

/** Le roi blanc, au centre de l'image : c'est sur lui que se fait la mise au point. */
const KING_POSITION = new THREE.Vector3(1, 0, 1);
const FOCUS_TARGET = new THREE.Vector3(1, 2.1, 1);

const ivory = new THREE.MeshPhysicalMaterial({
  color: "#e9dfcb",
  roughness: 0.32,
  clearcoat: 0.7,
  clearcoatRoughness: 0.2,
  sheen: 0.3,
  sheenColor: new THREE.Color("#fff2dc"),
});

const ebony = new THREE.MeshPhysicalMaterial({
  color: "#0e0d0c",
  roughness: 0.28,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
});

function useChessSet() {
  const { scene } = useGLTF(MODEL_URL, false, true);

  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const byName = new Map<string, THREE.Object3D>();
    scene.children.forEach((child) => byName.set(child.name, child));

    // Plateau (cases + cadre en noyer) récupéré tel quel, avec des couleurs plus chaudes.
    const board = new THREE.Group();
    ["Plane", "Cube"].forEach((name) => {
      const node = byName.get(name);
      if (!node) return;
      const copy = node.clone(true);
      copy.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.receiveShadow = true;
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        if (mat.name === "Material.002") mat.color.set("#d8cfbd");
        if (mat.name === "Material.003") mat.color.set("#121010");
        mat.roughness = 0.45;
        mesh.material = mat;
      });
      board.add(copy);
    });

    /** Clone une pièce et la recentre : origine au centre de sa base. */
    const makePiece = (piece: PieceName) => {
      const names = PIECES[piece];
      const isWhite = piece.startsWith("white");
      const group = new THREE.Group();
      names.forEach((name) => {
        const node = byName.get(name);
        if (!node) return;
        const copy = node.clone(true);
        copy.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.material = isWhite ? ivory : ebony;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        });
        group.add(copy);
      });
      const box = new THREE.Box3().setFromObject(group);
      const center = box.getCenter(new THREE.Vector3());
      group.position.set(-center.x, -box.min.y, -center.z);
      const pivot = new THREE.Group();
      pivot.add(group);
      return { object: pivot, height: box.max.y - box.min.y };
    };

    return { board, makePiece };
  }, [scene]);
}

type ChessSet = ReturnType<typeof useChessSet>;

interface PlacedPieceProps {
  set: ChessSet;
  piece: PieceName;
  position: [number, number, number];
  rotation?: [number, number, number];
  /** Pièce couchée sur le plateau : on la soulève de son demi-diamètre. */
  fallen?: boolean;
}

function PlacedPiece({ set, piece, position, rotation = [0, 0, 0], fallen = false }: PlacedPieceProps) {
  const { object } = useMemo(() => set.makePiece(piece), [set, piece]);
  const lift = fallen ? 0.6 : 0;
  return <primitive object={object} position={[position[0], position[1] + lift, position[2]]} rotation={rotation} />;
}

/** Caméra au ras du plateau, qui avance lentement et suit un peu la souris. */
function CameraRig() {
  const { camera, size } = useThree();
  const isMobile = size.width < 768;
  const start = useRef(performance.now());

  useFrame((state) => {
    const t = (performance.now() - start.current) / 1000;
    const intro = 1 - Math.pow(1 - Math.min(1, t / 4), 3); // ease-out sur 4 s
    const baseZ = isMobile ? 23 : 15.5;
    const z = baseZ + 3 * (1 - intro);
    const x = 1 + state.pointer.x * 0.9 + Math.sin(t * 0.2) * 0.25;
    const y = 1.35 + state.pointer.y * 0.35;
    camera.position.lerp(new THREE.Vector3(x, y, z), 0.06);
    camera.lookAt(FOCUS_TARGET.x, isMobile ? 4.3 : 3, FOCUS_TARGET.z);
  });

  return null;
}

function Scene({ onReady }: { onReady?: () => void }) {
  const set = useChessSet();

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <>
      <primitive object={set.board} />

      {/* Le héros de l'image */}
      <PlacedPiece set={set} piece="whiteKing" position={[KING_POSITION.x, 0, KING_POSITION.z]} rotation={[0, 0.3, 0]} />

      {/* Premier plan, flou : le roi noir à gauche, des pièces renversées à droite */}
      <PlacedPiece set={set} piece="blackKing" position={[-1.6, 0, 9.6]} rotation={[0, -0.4, 0]} />
      <PlacedPiece set={set} piece="blackRook" position={[-4.6, 0, 3.2]} rotation={[0, 0.6, Math.PI / 2]} fallen />
      <PlacedPiece set={set} piece="whitePawn" position={[-2.6, 0, 4.4]} rotation={[0, 0.25, Math.PI / 2]} fallen />
      <PlacedPiece set={set} piece="blackPawn" position={[5, 0, 6.4]} rotation={[0, 0.5, -Math.PI / 2]} fallen />
      <PlacedPiece set={set} piece="blackKnight" position={[6.2, 0, 3.4]} rotation={[0.2, -0.8, -Math.PI / 2]} fallen />
      <PlacedPiece set={set} piece="blackQueen" position={[4.4, 0, 1.6]} rotation={[0, -0.4, -Math.PI / 2.1]} fallen />

      {/* Arrière-plan */}
      <PlacedPiece set={set} piece="whiteRook" position={[-5, 0, -3]} rotation={[0, 0.4, 0]} />
      <PlacedPiece set={set} piece="blackBishop" position={[-1.6, 0, -4.6]} rotation={[0, 0.8, 0]} />
      <PlacedPiece set={set} piece="whiteKnight" position={[5.4, 0, -4.2]} rotation={[0, -2.2, 0]} />
      <PlacedPiece set={set} piece="blackPawn" position={[3, 0, -1.8]} rotation={[0, 0, 0]} />

      {/* Braises et poussière en suspension */}
      <Sparkles count={40} scale={[16, 7, 12]} position={[1, 3.5, 1]} size={2.4} speed={0.25} color="#ff9a4d" opacity={0.9} />
      <Sparkles count={110} scale={[18, 8, 14]} position={[1, 4, 0]} size={1.6} speed={0.15} color="#d9c7a8" opacity={0.5} />
    </>
  );
}

export default function ChessScene({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [1, 1.4, 16.5], fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: false, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <color attach="background" args={["#14110e"]} />
      <fog attach="fog" args={["#14110e", 14, 34]} />

      <ambientLight intensity={0.95} color="#ffe9cc" />
      {/* Contre-jour chaud au-dessus du roi, qui crée la silhouette lumineuse */}
      <spotLight
        position={[1, 3, -7]}
        angle={0.42}
        penumbra={0.9}
        intensity={420}
        color="#ffd7a6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        target-position={[1, 0, 1]}
      />
      {/* Lumière de face, douce, pour garder du détail sur le roi */}
      <spotLight position={[6, 5, 12]} angle={0.5} penumbra={1} intensity={140} color="#ffe2bf" target-position={[1, 2, 1]} />
      {/* Halo orangé derrière la scène */}
      <pointLight position={[1, 4, -10]} intensity={60} distance={30} color="#ff8a3d" />

      <Suspense fallback={null}>
        <Scene onReady={onReady} />
      </Suspense>
      <CameraRig />

      <EffectComposer multisampling={0}>
        <DepthOfField target={FOCUS_TARGET} worldFocusRange={5} focalLength={0.03} bokehScale={7} />
        <Bloom luminanceThreshold={0.75} luminanceSmoothing={0.2} intensity={0.7} mipmapBlur />
        <Noise opacity={0.045} />
        <Vignette offset={0.25} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL, false, true);
