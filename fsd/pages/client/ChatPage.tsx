'use client';

import React, { useState, useRef, useEffect } from 'react';
import { hapticFeedback, useLaunchParams } from '@telegram-apps/sdk-react';
import { useTelegramUser } from "@/fsd/app/providers/TelegramUser";
import { useMaterials } from '@/fsd/entities/meditation/hooks/useMaterials';
import { MaterialCard } from '@/fsd/shared/components/MaterialCard';
import { MarkdownMessage } from '@/fsd/shared/components/MarkdownMessage';
import { GlassBottomBar } from '@/fsd/shared/components/GlassBottomBar';
import { Send } from 'lucide-react';
import Image from 'next/image';

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
  const { data: allMaterials } = useMaterials();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize MediaRecorder for audio recording
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;

    hapticFeedback.impactOccurred('light');
    const userMessage = message;
    setMessage('');
    
    // Add message with animation
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const responseData = await response.json();
      
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
        materialIds = responseData;
      }
      
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
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
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
          
          stream.getTracks().forEach(track => track.stop());
          await transcribeAudio(audioBlob, mediaRecorder.mimeType);
        };
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);
        
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
      
      if (audioBlob.size < 1000) {
        alert('Аудиозапись слишком короткая. Попробуйте записать дольше.');
        return;
      }
      
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
      
      const response = await fetch('/api/speech', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Transcription failed');
      }
      
      const data = await response.json();
      
      if (data.text && data.text.trim()) {
        setMessage(data.text);
      } else {
        alert('Не удалось распознать речь. Попробуйте говорить четче.');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Ошибка при распознавании речи. Пожалуйста, попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-black">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/img/chatscreen.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="gradient-overlay-dark" />
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pt-6 pb-32 relative z-10">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} message-enter`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'glass-gradient ml-12 message-send'
                  : 'glass mr-12'
              }`}
            >
              <p className="text-white font-medium leading-relaxed">{msg.content}</p>
              
              {msg.materialIds && allMaterials && (
                <div className="mt-4 space-y-3">
                  {msg.materialIds.map((id) => {
                    const material = allMaterials.find(m => m.id === id);
                    if (!material) return null;
                    return (
                      <div key={id} className="glass p-3 rounded-xl">
                        <MaterialCard material={material} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4 message-enter">
            <div className="glass p-4 rounded-2xl mr-12">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Bar */}
      <div className="absolute bottom-24 left-0 right-0 px-4 z-20">
        <div className="glass-gradient rounded-full p-2 flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-transparent px-4 py-3 text-white placeholder-white/50 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className="p-3 rounded-full glass hover:glass-light transition-all duration-300 disabled:opacity-50"
          >
            <Send size={20} className="text-white" />
          </button>
        </div>
      </div>
      
      {/* Glass Bottom Bar */}
      <GlassBottomBar 
        onMicPress={toggleRecording}
        isRecording={isRecording}
      />
    </div>
  );
};