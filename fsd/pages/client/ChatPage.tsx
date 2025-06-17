'use client';

import React, { useState, useRef, useEffect } from 'react';
import { hapticFeedback, useLaunchParams } from '@telegram-apps/sdk-react';
import { useTelegramUser } from "@/fsd/app/providers/TelegramUser";
import { useMaterials } from '@/fsd/entities/meditation/hooks/useMaterials';
import { MaterialCard } from '@/fsd/shared/components/MaterialCard';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const ChatPage = () => {
  try {
  const { user } = useTelegramUser();
  const launchParams = useLaunchParams();
  const telegramUser = launchParams?.tgWebAppData?.user;
  
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, materialIds?: number[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const mountRef = useRef<HTMLDivElement>(null);
  const { data: allMaterials } = useMaterials();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  console.log('ChatPage - User from DB:', user);
  console.log('ChatPage - TelegramUser from launchParams:', telegramUser);
  console.log('ChatPage - Component rendered');
  console.log('ChatPage - Messages:', messages);
  console.log('ChatPage - Current message:', message);

  // Initialize MediaRecorder for audio recording
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

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

  const handleSend = async () => {
    console.log('handleSend called with message:', message);
    if (!message.trim()) return;

    hapticFeedback.impactOccurred('light');
    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    console.log('Sending message to API:', userMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: user?.telegram_id || telegramUser?.id || 123456789,
          question: userMessage,
        }),
      });

      console.log('Chat API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Chat API error response:', errorData);
        throw new Error(errorData.error || 'Failed to get response');
      }

      const responseData = await response.json();
      console.log('Received response data:', responseData);
      
      // Extract material IDs and comment from the response structure
      let materialIds: number[] = [];
      let assistantComment = '';
      
      if (Array.isArray(responseData) && responseData.length > 0 && responseData[0].output) {
        try {
          const outputData = JSON.parse(responseData[0].output);
          if (outputData.results && Array.isArray(outputData.results)) {
            materialIds = outputData.results;
          }
          if (outputData.comment) {
            assistantComment = outputData.comment;
          }
        } catch (parseError) {
          console.error('Failed to parse output:', parseError);
        }
      } else if (Array.isArray(responseData)) {
        // Fallback: if it's already a simple array
        materialIds = responseData;
      }
      
      console.log('Extracted material IDs:', materialIds);
      console.log('Assistant comment:', assistantComment);
      
      if (materialIds.length > 0) {
        const displayComment = assistantComment || `Я нашел ${materialIds.length} ${materialIds.length === 1 ? 'практику' : 'практики'} для вас:`;
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: displayComment,
          materialIds
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Не удалось найти подходящие практики по вашему запросу. Попробуйте просмотреть каталог или спросить что-то другое.' 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    hapticFeedback.impactOccurred('medium');
    
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        // Check if we're in Telegram Web App
        const isTelegramWebApp = !!(window as any).Telegram?.WebApp;
        
        if (isTelegramWebApp) {
          console.log('Running in Telegram WebApp, attempting microphone access...');
          
          // Try to request permissions through Telegram WebApp if available
          const webApp = (window as any).Telegram.WebApp;
          if (webApp.requestContact) {
            console.log('Telegram WebApp API available');
          }
        }

        // Request microphone access
        const constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        audioChunksRef.current = [];
        
        const mediaRecorder = new MediaRecorder(stream, { 
          mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
            ? 'audio/webm;codecs=opus' 
            : MediaRecorder.isTypeSupported('audio/webm') 
            ? 'audio/webm' 
            : 'audio/mp4'
        });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType
          });
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          
          // Send audio to transcription API
          await transcribeAudio(audioBlob);
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        
        console.log('Recording started successfully');
        
      } catch (error: any) {
        console.error('Error accessing microphone:', error);
        
        let errorMessage = 'Не удалось получить доступ к микрофону.';
        
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Доступ к микрофону запрещен. Пожалуйста, разрешите доступ к микрофону в настройках браузера или Telegram.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'Микрофон не найден. Проверьте подключение микрофона.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Запись аудио не поддерживается в данном браузере.';
        }
        
        alert(errorMessage);
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      
      console.log('Starting audio transcription...', {
        blobSize: audioBlob.size,
        blobType: audioBlob.type
      });
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      console.log('Sending request to /api/speech...');
      const response = await fetch('/api/speech', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Speech API response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Speech API error response:', errorText);
        throw new Error(`Speech API failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Speech API response data:', data);
      
      if (data.success && data.text && data.text.trim()) {
        console.log('Successfully transcribed:', data.text);
        setMessage(prev => prev + data.text.trim() + ' ');
      } else if (!data.success) {
        console.error('Speech API returned error:', data);
        alert(data.text || 'Ошибка распознавания речи');
      } else {
        console.warn('Speech API returned empty result:', data);
        alert('Не удалось распознать речь');
      }
      
    } catch (error) {
      console.error('Transcription error:', error);
      alert(`Ошибка при распознавании речи: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0A0F] overflow-hidden">
      {/* Full screen cosmic sphere background */}
      <div 
        ref={mountRef}
        className="absolute inset-0 w-full h-full"
        id="canvas_container"
      />

      {/* UI overlay */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Top section with title */}
        <div className="flex-shrink-0 pt-20 pb-4 text-center bg-gradient-to-b from-black/70 via-black/40 to-transparent">
          <h2 className="text-2xl font-bold font-['Unbounded'] text-white mb-2 drop-shadow-lg">STARUNITY AI HELPER </h2>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: 'calc(80px + 70px)' }}>
          <div className="w-full max-w-lg mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className="space-y-3">
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl backdrop-blur-md ${
                  msg.role === 'user' 
                    ? 'bg-purple-600/80 border border-purple-400/30 text-white shadow-lg' 
                    : 'bg-white/10 border border-white/20 text-white shadow-lg'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
              
              {/* Material cards carousel */}
              {msg.role === 'assistant' && msg.materialIds && msg.materialIds.length > 0 && (
                <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-3 pb-2">
                    {allMaterials
                      ?.filter(m => msg.materialIds?.includes(m.id))
                      .map(material => (
                        <MaterialCard 
                          key={material.id} 
                          material={material} 
                          compact 
                        />
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/20 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Input area */}
        <div className="fixed left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent" style={{ bottom: '70px' }}>
          <div className="bg-white/5 backdrop-blur-3xl border-t border-white/10 p-4">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="w-full bg-white/90 backdrop-blur-xl border border-white/30 text-gray-900 placeholder-gray-500 rounded-full px-5 py-3 pr-12 outline-none focus:bg-white focus:border-white/50 transition-all shadow-lg"
            />
            <button
              onClick={toggleRecording}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${
                isRecording 
                  ? 'bg-red-500/90 border-red-400/50 animate-pulse' 
                  : 'bg-white/20 border-white/30 hover:bg-white/30'
              }`}
            >
              {/* Microphone icon from Iconify style */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
                <path fill={isRecording ? "white" : "#6B7280"} d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/>
                <path fill={isRecording ? "white" : "#6B7280"} d="M17 11a1 1 0 0 1 2 0a7 7 0 1 1-14 0a1 1 0 0 1 2 0a5 5 0 1 0 10 0Z"/>
                <path fill={isRecording ? "white" : "#6B7280"} d="M12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"/>
              </svg>
            </button>
          </div>
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="w-12 h-12 bg-purple-600/80 backdrop-blur-md border border-purple-400/50 rounded-full flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 hover:bg-purple-600/90 disabled:hover:scale-100"
          >
            {/* Send icon from Iconify style */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
              <path fill="white" d="M3 20v-6l8-2l-8-2V4l19 8z"/>
            </svg>
          </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('ChatPage render error:', error);
    return <div className="text-white p-4">Error rendering chat page: {String(error)}</div>;
  }
};