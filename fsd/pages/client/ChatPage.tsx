'use client';

import React, { useState, useRef, useEffect } from 'react';
import { hapticFeedback, useLaunchParams } from '@telegram-apps/sdk-react';
import { useTelegramUser } from "@/fsd/app/providers/TelegramUser";
import { useMaterials } from '@/fsd/entities/meditation/hooks/useMaterials';
import { MaterialCard } from '@/fsd/shared/components/MaterialCard';
import { MarkdownMessage } from '@/fsd/shared/components/MarkdownMessage';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const ChatPage = () => {
  const { user } = useTelegramUser();
  const launchParams = useLaunchParams();
  const telegramUser = launchParams?.tgWebAppData?.user;
  
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, materialIds?: number[] }[]>([
    {
      role: 'assistant',
      content: 'Какой запрос сегодня? Что реально на душе сейчас? ✨'
    }
  ]);
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
          telegram_id: user?.telegram_id || telegramUser?.id,
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
      
      if (materialIds.length > 0 || assistantComment) {
        const displayComment = assistantComment || `Я нашел ${materialIds.length} ${materialIds.length === 1 ? 'практику' : 'практики'} для вас:`;
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: displayComment,
          materialIds: materialIds.length > 0 ? materialIds : undefined
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
        
        // Choose the best supported audio format for Whisper
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        }
        
        console.log('Using audio format:', mimeType);
        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: mediaRecorder.mimeType
          });
          
          console.log('Audio recorded:', {
            size: audioBlob.size,
            type: audioBlob.type,
            chunks: audioChunksRef.current.length
          });
          
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
          
          // Send audio to transcription API
          await transcribeAudio(audioBlob, mediaRecorder.mimeType);
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

  const transcribeAudio = async (audioBlob: Blob, mimeType: string) => {
    try {
      setIsLoading(true);
      
      console.log('Starting audio transcription...', {
        blobSize: audioBlob.size,
        blobType: audioBlob.type
      });
      
      // Check if audio blob is too small (less than 1KB probably means no audio)
      if (audioBlob.size < 1000) {
        console.warn('Audio blob too small:', audioBlob.size, 'bytes');
        alert('Аудиозапись слишком короткая. Попробуйте записать дольше.');
        return;
      }
      
      // Determine proper filename based on mime type
      let filename = 'recording.webm';
      if (mimeType.includes('mp4')) {
        filename = 'recording.mp4';
      } else if (mimeType.includes('wav')) {
        filename = 'recording.wav';
      } else if (mimeType.includes('webm')) {
        filename = 'recording.webm';
      }
      
      const formData = new FormData();
      formData.append('audio', audioBlob, filename);
      
      console.log('FormData prepared:', {
        filename,
        blobSize: audioBlob.size,
        blobType: audioBlob.type,
        formDataKeys: Array.from(formData.keys()),
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          valueType: typeof value,
          isFile: value instanceof File,
          isBlob: value instanceof Blob,
          ...(value instanceof File && { name: value.name, size: value.size, type: value.type }),
          ...(value instanceof Blob && !value.name && { size: value.size, type: value.type })
        }))
      });
      
      console.log('Sending request to /api/speech...');
      console.log('Request details:', {
        method: 'POST',
        hasFormData: !!formData,
        contentType: 'multipart/form-data (automatic)',
        url: '/api/speech'
      });
      
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

  try {
    return (
      <div className="fixed inset-0 bg-dark-bg overflow-hidden">
        {/* Full screen cosmic sphere background */}
        <div 
          ref={mountRef}
          className="absolute inset-0 w-full h-full"
          id="canvas_container"
        />

        {/* UI overlay */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Top section with title */}
          <div className="flex-shrink-0 pb-4 text-center bg-gradient-to-b from-dark-bg/90 via-dark-bg/50 to-transparent" style={{ paddingTop: 'max(95px, env(safe-area-inset-top))' }}>
            <h2 className="text-2xl font-bold text-white mb-2 text-glow" style={{ fontFamily: 'Inter Tight, sans-serif' }}>STARUNITY AI HELPER</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4" style={{ paddingBottom: 'calc(80px + 70px)' }}>
            <div className="w-full max-w-lg mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl backdrop-blur-md ${
                      msg.role === 'user' 
                        ? 'bg-gradient-accent border border-purple-400/30 text-white shadow-glow-sm' 
                        : 'glass border border-purple-500/20 text-white shadow-lg'
                    }`}>
                      <MarkdownMessage content={msg.content} className="text-sm" />
                    </div>
                  </div>
                  
                  {/* Material cards carousel */}
                  {msg.role === 'assistant' && msg.materialIds && msg.materialIds.length > 0 && allMaterials && (
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
          <div className="fixed left-0 right-0 bg-dark-bg/95 backdrop-blur-xl border-t border-purple-500/20" style={{ bottom: '70px' }}>
            <div className="px-4 py-4">
              <div className="flex items-end gap-3 max-w-lg mx-auto">
                <div className="flex-1 relative">
                  <div className="relative glass border border-purple-500/30 rounded-3xl p-1 shadow-glow-sm">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Напишите ваш запрос..."
                      rows={1}
                      className="w-full bg-transparent text-white px-5 py-3 pr-14 outline-none resize-none overflow-hidden placeholder-purple-300/50"
                      style={{
                        minHeight: '48px',
                        maxHeight: '120px',
                        height: 'auto'
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                      }}
                    />
                    <button
                      onClick={toggleRecording}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center transition-all ${
                        isRecording 
                          ? 'text-red-400 animate-pulse' 
                          : 'text-purple-400/60 hover:text-purple-300'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className={`transition-all ${isRecording ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]'}`}>
                        <path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/>
                        <path fill="currentColor" d="M17 11a1 1 0 0 1 2 0a7 7 0 1 1-14 0a1 1 0 0 1 2 0a5 5 0 1 0 10 0Z"/>
                        <path fill="currentColor" d="M12 19a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  className="relative w-14 h-14 bg-gradient-accent rounded-full flex items-center justify-center disabled:opacity-50 transition-all hover:scale-105 hover:shadow-glow disabled:hover:scale-100 group overflow-hidden"
                >
                  {/* Animated rocket icon */}
                  <div className="relative z-10 transition-transform group-hover:-translate-y-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="animate-float">
                      <path fill="white" d="M2.81 14.12L5.64 12.5C6.22 10.93 7 9.46 7.91 8.1L1.81 10.87L2.81 14.12M8.88 16.53L7.47 15.12L6.24 22H4.83L8.91 17.91C9.21 18.12 9.54 18.27 9.88 18.36L6.24 22M13.13 22.19L15.9 16.09C14.54 17 13.07 17.78 11.5 18.36L13.13 22.19M21.61 2.39C23.73 7.34 18.07 13 18.07 13C15.88 15.19 13.5 16.53 11.36 17.35C10.61 17.63 9.79 17.45 9.24 16.89L7.11 14.77C6.56 14.21 6.37 13.39 6.65 12.64C7.5 10.53 8.81 8.12 11 5.93C16.66.269 21.61 2.39 21.61 2.39Z"/>
                      <circle cx="14.5" cy="9.5" r="1.3" fill="#a855f7" className="animate-pulse"/>
                    </svg>
                  </div>
                  
                  {/* Particle effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute bottom-2 left-3 w-1 h-1 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.5s' }}></div>
                    <div className="absolute bottom-3 left-5 w-0.5 h-0.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.8s' }}></div>
                    <div className="absolute bottom-1 left-7 w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1.2s' }}></div>
                    <div className="absolute bottom-4 left-2 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '1.6s' }}></div>
                  </div>
                  
                  {/* Continuous glow animation */}
                  <div className="absolute inset-0 bg-gradient-accent rounded-full animate-pulse opacity-30"></div>
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