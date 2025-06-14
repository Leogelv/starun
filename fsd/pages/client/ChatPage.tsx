"use client"
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { LiquidSphere } from '@/fsd/shared/components/LiquidSphere';
import { MaterialCard } from '@/fsd/shared/components/MaterialCard';
import { MeditationMaterial } from '@/fsd/shared/types/meditation';
import { useTelegramUser } from '@/fsd/app/providers/TelegramUser';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    materials?: MeditationMaterial[];
}

export function ChatPage() {
    const { user } = useTelegramUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleOpenLink = (link: string) => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openLink(link, { try_instant_view: true });
        } else {
            window.open(link, '_blank');
        }
    };

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text,
            isUser: true
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Send to AI endpoint
            const response = await fetch('https://primary-production-ee24.up.railway.app/webhook/get_rec', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    telegram_id: user?.telegram_id || 'anonymous',
                    question: text
                })
            });

            const materialIds = await response.json();

            // Fetch materials by IDs
            const materialsResponse = await fetch('/api/materials/by-ids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ids: materialIds })
            });

            const materials = await materialsResponse.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: materials.length > 0 
                    ? 'Вот что я нашел для вас:' 
                    : 'К сожалению, я не нашел подходящих материалов по вашему запросу.',
                isUser: false,
                materials: materials
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Произошла ошибка при обработке вашего запроса. Попробуйте еще раз.',
                isUser: false
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                await transcribeAudio(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const transcribeAudio = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-1');

            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_TOKEN}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.text) {
                setInputText(data.text);
            }
        } catch (error) {
            console.error('Error transcribing audio:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            {/* Header with 3D Sphere */}
            <div className="relative">
                <LiquidSphere />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-white drop-shadow-lg">AI Помощник</h1>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        <p className="text-lg mb-2">Привет! Я ваш AI помощник.</p>
                        <p>Спросите меня о медитации, и я подберу для вас подходящие материалы.</p>
                    </div>
                )}
                
                {messages.map((message) => (
                    <div key={message.id}>
                        <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                message.isUser 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-white/80 backdrop-blur-sm border border-purple-100'
                            }`}>
                                <p className={message.isUser ? 'text-white' : 'text-gray-800'}>
                                    {message.text}
                                </p>
                            </div>
                        </div>
                        
                        {message.materials && message.materials.length > 0 && (
                            <div className="space-y-3 mb-4">
                                {message.materials.map((material) => (
                                    <MaterialCard
                                        key={material.id}
                                        material={material}
                                        onOpenLink={handleOpenLink}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/80 backdrop-blur-sm border border-purple-100 rounded-2xl px-4 py-3">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-purple-100 bg-white/80 backdrop-blur-lg px-4 py-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
                        placeholder="Напишите ваш вопрос..."
                        className="flex-1 px-4 py-3 rounded-full bg-white border border-purple-200 focus:outline-none focus:border-purple-400 transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => isRecording ? stopRecording() : startRecording()}
                        className={`p-3 rounded-full transition-all ${
                            isRecording 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
                        }`}
                    >
                        {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => sendMessage(inputText)}
                        disabled={!inputText.trim() || isLoading}
                        className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
} 