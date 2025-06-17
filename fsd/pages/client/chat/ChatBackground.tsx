'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const ChatBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Cosmic sphere animation
  useEffect(() => {
    console.log('3D effect starting, mountRef:', mountRef.current);
    const container = mountRef.current;
    if (!container) {
      console.error('Mount ref not found!');
      return;
    }

    let renderer: THREE.WebGLRenderer,
      scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      sphereBg: THREE.Mesh,
      nucleus: THREE.Mesh,
      stars: THREE.Points,
      controls: OrbitControls;
    
    const noise3D = createNoise3D();
    const blobScale = 3;

    function init() {
      if (!container) return;
      
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
      );
      camera.position.set(0, 0, 230);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
      directionalLight.position.set(0, 50, -20);
      scene.add(directionalLight);

      let ambientLight = new THREE.AmbientLight(0xffffff, 1);
      ambientLight.position.set(0, 20, 20);
      scene.add(ambientLight);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      // OrbitControls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.autoRotate = true;
      controls.autoRotateSpeed = 1.5;
      controls.maxDistance = 350;
      controls.minDistance = 150;
      controls.enablePan = false;

      const loader = new THREE.TextureLoader();
      const textureSphereBg = loader.load(
        "https://i.ibb.co/4gHcRZD/bg3-je3ddz.jpg"
      );
      const texturenucleus = loader.load(
        "https://i.ibb.co/hcN2qXk/star-nc8wkw.jpg"
      );
      const textureStar = loader.load("https://i.ibb.co/ZKsdYSz/p1-g3zb2a.png");
      const texture1 = loader.load("https://i.ibb.co/F8by6wW/p2-b3gnym.png");
      const texture2 = loader.load("https://i.ibb.co/yYS2yx5/p3-ttfn70.png");
      const texture4 = loader.load("https://i.ibb.co/yWfKkHh/p4-avirap.png");

      // Nucleus
      texturenucleus.anisotropy = 16;
      let icosahedronGeometry = new THREE.IcosahedronGeometry(30, 10);
      let lambertMaterial = new THREE.MeshPhongMaterial({ map: texturenucleus });
      nucleus = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
      scene.add(nucleus);

      // Sphere Background
      textureSphereBg.anisotropy = 16;
      let geometrySphereBg = new THREE.SphereGeometry(150, 40, 40);
      let materialSphereBg = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        map: textureSphereBg
      });
      sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
      scene.add(sphereBg);

      // Moving Stars
      let starsGeometry = new THREE.BufferGeometry();
      let positions = [];
      let velocities = [];
      let startPositions = [];

      for (let i = 0; i < 50; i++) {
        let particleStar = randomPointSphere(150);
        positions.push(particleStar.x, particleStar.y, particleStar.z);
        velocities.push(THREE.MathUtils.randInt(50, 200));
        startPositions.push(particleStar.x, particleStar.y, particleStar.z);
      }

      starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      
      let starsMaterial = new THREE.PointsMaterial({
        size: 5,
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        map: textureStar,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      
      stars = new THREE.Points(starsGeometry, starsMaterial);
      stars.userData = { velocities, startPositions };
      scene.add(stars);

      // Fixed Stars
      function createStars(texture: THREE.Texture, size: number, total: number) {
        let pointGeometry = new THREE.BufferGeometry();
        let positions = [];

        for (let i = 0; i < total; i++) {
          let radius = THREE.MathUtils.randInt(70, 149);
          let particles = randomPointSphere(radius);
          positions.push(particles.x, particles.y, particles.z);
        }

        pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        
        let pointMaterial = new THREE.PointsMaterial({
          size: size,
          map: texture,
          blending: THREE.AdditiveBlending
        });

        return new THREE.Points(pointGeometry, pointMaterial);
      }
      
      scene.add(createStars(texture1, 15, 20));
      scene.add(createStars(texture2, 5, 5));
      scene.add(createStars(texture4, 7, 5));

      function randomPointSphere(radius: number) {
        let theta = 2 * Math.PI * Math.random();
        let phi = Math.acos(2 * Math.random() - 1);
        let dx = 0 + radius * Math.sin(phi) * Math.cos(theta);
        let dy = 0 + radius * Math.sin(phi) * Math.sin(theta);
        let dz = 0 + radius * Math.cos(phi);
        return new THREE.Vector3(dx, dy, dz);
      }
    }

    function animate() {
      // Stars Animation
      const positions = stars.geometry.attributes.position.array as Float32Array;
      const { velocities, startPositions } = stars.userData;
      
      for (let i = 0; i < positions.length / 3; i++) {
        let idx = i * 3;
        positions[idx] += (0 - positions[idx]) / velocities[i];
        positions[idx + 1] += (0 - positions[idx + 1]) / velocities[i];
        positions[idx + 2] += (0 - positions[idx + 2]) / velocities[i];

        velocities[i] -= 0.3;

        if (positions[idx] <= 5 && positions[idx] >= -5 && 
            positions[idx + 2] <= 5 && positions[idx + 2] >= -5) {
          positions[idx] = startPositions[idx];
          positions[idx + 1] = startPositions[idx + 1];
          positions[idx + 2] = startPositions[idx + 2];
          velocities[i] = THREE.MathUtils.randInt(50, 300);
        }
      }
      stars.geometry.attributes.position.needsUpdate = true;

      // Nucleus Animation
      const nucleusGeometry = nucleus.geometry as THREE.IcosahedronGeometry;
      const positionAttribute = nucleusGeometry.attributes.position;
      const vertex = new THREE.Vector3();
      const time = Date.now();

      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        vertex.normalize();
        
        const distance = 30 + noise3D(
          vertex.x + time * 0.0002,
          vertex.y + time * 0.0001,
          vertex.z + time * 0.0003
        ) * blobScale;
        
        vertex.multiplyScalar(distance);
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      
      positionAttribute.needsUpdate = true;
      nucleusGeometry.computeVertexNormals();
      nucleus.rotation.y += 0.001;

      // Sphere Background Animation
      sphereBg.rotation.x += 0.001;
      sphereBg.rotation.y += 0.001;
      sphereBg.rotation.z += 0.001;

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    init();
    animate();

    // Handle resize
    function onWindowResize() {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    }

    window.addEventListener('resize', onWindowResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (container && renderer?.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer?.dispose();
    };
  }, []);

  return (
    <>
      {/* Background image with gradient overlay */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/img/chatscreen.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-blue-900/60 to-blue-950/80"></div>
      <div className="absolute inset-0 backdrop-blur-[0.5px]"></div>
      
      {/* Cosmic sphere background (reduced opacity) */}
      <div 
        ref={mountRef}
        className="absolute inset-0 w-full h-full opacity-20"
        id="canvas_container"
      />
    </>
  );
};