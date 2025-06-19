'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { hapticFeedback, useLaunchParams } from '@telegram-apps/sdk-react';
import { useTelegramUser } from "@/fsd/app/providers/TelegramUser";
import { useMaterials } from '@/fsd/entities/meditation/hooks/useMaterials';
import { GlassBottomBar } from '@/fsd/shared/components/GlassBottomBar';
import { getApiBaseURL } from '@/fsd/shared/api';
import { ChatBackground } from './chat/ChatBackground';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessages } from './chat/ChatMessages';
import { ChatHistoryPopup } from './chat/ChatHistoryPopup';

export const ChatPage = () => {
  const { user } = useTelegramUser();
  const launchParams = useLaunchParams();
  const telegramUser = launchParams?.tgWebAppData?.user;
  
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string, materialIds?: number[] }[]>([]);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { data: allMaterials } = useMaterials();
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  console.log('ChatPage - User from DB:', user);
  console.log('ChatPage - TelegramUser from launchParams:', telegramUser);
  console.log('ChatPage - Component rendered');
  console.log('ChatPage - Messages:', messages);
  console.log('ChatPage - Current message:', message);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize new session if needed
  useEffect(() => {
    if (!sessionId && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Какой запрос сегодня? Что реально на душе сейчас? ✨'
      }]);
    }
  }, [sessionId, messages.length]);

  // Initialize MediaRecorder for audio recording
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);


  const handleSend = useCallback(async () => {
    console.log('handleSend called with message:', message);
    if (!message.trim()) return;

    hapticFeedback.impactOccurred('light');
    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    console.log('Sending message to API:', { userMessage, sessionId });

    // Create new session if needed or continue existing
    let currentSessionId = sessionId;
    if (!currentSessionId || (lastMessageTime && new Date().getTime() - lastMessageTime.getTime() > 30 * 60 * 1000)) {
      // Create new session if no session or 30+ minutes since last message
      currentSessionId = crypto.randomUUID();
      setSessionId(currentSessionId);
      console.log('Creating new session:', currentSessionId);
    }
    
    setLastMessageTime(new Date());

    try {
      const response = await fetch(`${getApiBaseURL()}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_id: user?.telegram_id || telegramUser?.id,
          question: userMessage,
          session_id: currentSessionId,
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
      
      // Auto-scroll after AI response
      scrollToBottom();
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.`
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [message, user, telegramUser, sessionId, lastMessageTime, scrollToBottom]);

  const toggleRecording = useCallback(async () => {
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
  }, [isRecording]);

  const handleSessionSelect = useCallback(async (selectedSessionId: string) => {
    try {
      console.log('Loading session:', selectedSessionId);
      
      // Get all user's messages from external API
      const telegramId = user?.telegram_id || telegramUser?.id;
      console.log('Loading messages for telegram_id:', telegramId);
      
      const response = await fetch(`https://primary-production-ee24.up.railway.app/webhook/my_chats?telegram_id=${telegramId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const allMessages = await response.json();
        
        // Filter messages for selected session
        const sessionMessages = allMessages
          .filter((msg: any) => msg.session_id === selectedSessionId)
          .sort((a: any, b: any) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        
        console.log('Loaded session messages:', sessionMessages);
        
        // Convert to chat format
        const chatMessages = sessionMessages.map((msg: any) => ({
          role: msg.message_type as 'user' | 'assistant',
          content: msg.content,
          materialIds: msg.material_ids
        }));
        
        setMessages(chatMessages);
        setSessionId(selectedSessionId);
        setLastMessageTime(new Date());
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }, [user?.telegram_id, telegramUser?.id]);

  const transcribeAudio = useCallback(async (audioBlob: Blob, mimeType: string) => {
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
        url: `${getApiBaseURL()}/speech`
      });
      
      const response = await fetch(`${getApiBaseURL()}/speech`, {
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
  }, [setMessage, setIsLoading]);


  try {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Background */}
        <ChatBackground />

        {/* Main content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with History Icon */}
          <div className="relative flex-shrink-0">
            <ChatHeader />
            <ChatHistoryPopup onSessionSelect={handleSessionSelect} />
          </div>

          {/* Messages */}
          <ChatMessages 
            messages={messages}
            isLoading={isLoading}
            allMaterials={allMaterials}
            userAvatarUrl={useMemo(() => telegramUser?.photo_url || user?.photo_url || undefined, [telegramUser?.photo_url, user?.photo_url])}
            userName={useMemo(() => telegramUser?.first_name || user?.first_name || undefined, [telegramUser?.first_name, user?.first_name])}
            messagesEndRef={messagesEndRef}
          />

          {/* Glass Bottom Bar */}
          <div className="flex-shrink-0">
            <GlassBottomBar
              onMicrophoneClick={toggleRecording}
              isRecording={isRecording}
              showTextInput={true}
              message={message}
              onMessageChange={setMessage}
              onSendMessage={handleSend}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ChatPage render error:', error);
    return <div className="text-white p-4">Error rendering chat page: {String(error)}</div>;
  }
};