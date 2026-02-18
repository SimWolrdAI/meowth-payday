"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";

function MeowthModel() {
  const groupRef = useRef<THREE.Group>(null);

  // Load all 3 models
  const idle = useGLTF("/Meshy_AI_Character_output.glb");
  const walking = useGLTF("/Meshy_AI_Animation_Walking_withSkin.glb");
  const running = useGLTF("/Meshy_AI_Animation_Running_withSkin.glb");

  // Collect all animations from all files
  const allAnimations = useMemo(() => {
    return [...idle.animations, ...walking.animations, ...running.animations];
  }, [idle.animations, walking.animations, running.animations]);

  const { actions } = useAnimations(allAnimations, groupRef);

  // Refs for bones
  const headBone = useRef<THREE.Bone | null>(null);
  const neckBone = useRef<THREE.Bone | null>(null);
  const headBaseRotation = useRef(new THREE.Quaternion());
  const neckBaseRotation = useRef(new THREE.Quaternion());
  const time = useRef(0);

  // Find bones and play idle animation
  useEffect(() => {
    idle.scene.traverse((child) => {
      if (child instanceof THREE.Bone) {
        if (child.name === "Head") {
          headBone.current = child;
          headBaseRotation.current.copy(child.quaternion);
        }
        if (child.name === "neck") {
          neckBone.current = child;
          neckBaseRotation.current.copy(child.quaternion);
        }
      }
    });

    // Play idle animation
    const animNames = Object.keys(actions);
    if (animNames.length > 0) {
      const idleAction = actions[animNames[0]];
      if (idleAction) {
        idleAction.reset().fadeIn(0.3).play();
        idleAction.setLoop(THREE.LoopRepeat, Infinity);
      }
    }
  }, [idle.scene, actions]);

  useFrame((_, delta) => {
    time.current += delta;
    const t = time.current;

    // Always talking — continuous head movement
    if (headBone.current) {
      const head = headBone.current;

      // Mix of fast talk bob + slower expressive movement
      const fastNod = Math.sin(t * 7) * 0.05;
      const slowNod = Math.sin(t * 1.2) * 0.03;
      const tilt = Math.sin(t * 4.3) * 0.03;
      const slowTilt = Math.sin(t * 0.7) * 0.02;

      const euler = new THREE.Euler(
        fastNod + slowNod,     // nod up/down
        tilt + slowTilt,       // side tilt
        Math.sin(t * 2.8) * 0.015  // slight roll
      );
      const talkQuat = new THREE.Quaternion().setFromEuler(euler);
      const target = headBaseRotation.current.clone().multiply(talkQuat);

      head.quaternion.slerp(target, 0.2);
    }

    // Neck follows head softly
    if (neckBone.current) {
      const neck = neckBone.current;
      const neckNod = Math.sin(t * 1.5) * 0.02;
      const neckTilt = Math.sin(t * 0.9) * 0.015;
      const euler = new THREE.Euler(neckNod, neckTilt, 0);
      const neckQuat = new THREE.Quaternion().setFromEuler(euler);
      const target = neckBaseRotation.current.clone().multiply(neckQuat);
      neck.quaternion.slerp(target, 0.08);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.3, 0]} scale={0.6}>
      <primitive object={idle.scene} />
    </group>
  );
}

export default function MeowthScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.6, 4], fov: 28 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
      <directionalLight position={[-2, 3, -2]} intensity={0.3} color="#fde68a" />
      <pointLight position={[0, 2, 3]} intensity={0.5} />

      <MeowthModel />
    </Canvas>
  );
}

useGLTF.preload("/Meshy_AI_Character_output.glb");
useGLTF.preload("/Meshy_AI_Animation_Walking_withSkin.glb");
useGLTF.preload("/Meshy_AI_Animation_Running_withSkin.glb");
