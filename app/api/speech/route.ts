import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OpenAIError } from '@/types/openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== Speech API POST called ===');
    
    const formData = await request.formData();
    console.log('FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
      key,
      valueType: typeof value,
      isFile: value instanceof File,
      ...(value instanceof File && { name: value.name, size: value.size, type: value.type })
    })));
    
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      console.error('❌ No audio file provided in FormData');
      return NextResponse.json({ 
        error: 'No audio file provided',
        success: false,
        text: 'Аудио файл не найден в запросе'
      }, { status: 400 });
    }

    console.log('✅ Received audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Validate file size (OpenAI Whisper has 25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioFile.size > maxSize) {
      console.error('❌ File too large:', audioFile.size, 'bytes (max:', maxSize, ')');
      return NextResponse.json({ 
        error: 'File too large',
        success: false,
        text: 'Аудио файл слишком большой. Максимальный размер: 25MB'
      }, { status: 400 });
    }

    // Check if file is empty
    if (audioFile.size === 0) {
      console.error('❌ Empty file');
      return NextResponse.json({ 
        error: 'Empty file',
        success: false,
        text: 'Аудио файл пустой'
      }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json({ 
        text: 'OpenAI API ключ не настроен. Проверьте переменные окружения.',
        success: false,
        error: 'API key missing'
      });
    }

    // Convert and process audio file for OpenAI Whisper
    try {
      // Determine proper file extension and type
      let fileName = audioFile.name;
      let mimeType = audioFile.type;
      
      // Handle different audio formats
      if (fileName.endsWith('.m4a') || mimeType === 'audio/m4a') {
        fileName = fileName.endsWith('.m4a') ? fileName : 'recording.m4a';
        mimeType = 'audio/m4a';
      } else if (fileName.endsWith('.webm') || mimeType.includes('webm')) {
        fileName = fileName.endsWith('.webm') ? fileName : 'recording.webm';
        mimeType = 'audio/webm';
      } else if (fileName.endsWith('.wav') || mimeType === 'audio/wav') {
        fileName = fileName.endsWith('.wav') ? fileName : 'recording.wav';
        mimeType = 'audio/wav';
      } else if (fileName.endsWith('.mp3') || mimeType === 'audio/mp3') {
        fileName = fileName.endsWith('.mp3') ? fileName : 'recording.mp3';
        mimeType = 'audio/mp3';
      } else {
        // Default to webm if unknown
        fileName = 'recording.webm';
        mimeType = 'audio/webm';
      }
      
      // Convert File to buffer - OpenAI SDK handles the rest
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      
      // Create a blob-like object that OpenAI SDK expects
      const fileBlob = new Blob([buffer], { type: mimeType });
      Object.defineProperty(fileBlob, 'name', { value: fileName });

      console.log('✅ Sending to OpenAI Whisper:', {
        fileName,
        type: mimeType,
        size: buffer.length
      });
      
      console.log('📤 Making request to OpenAI Whisper...');
      const transcription = await openai.audio.transcriptions.create({
        file: fileBlob as any,
        model: 'whisper-1',
        language: 'ru',
        response_format: 'verbose_json',
        temperature: 0.0,
        prompt: 'Это запрос о медитации, йоге, практиках осознанности или здоровье.',
      });

      console.log('✅ Transcription successful:', {
        text: transcription.text,
        language: transcription.language,
        duration: transcription.duration,
        segments: transcription.segments?.length
      });

      const transcribedText = transcription.text || '';
      const confidence = transcription.segments?.[0]?.avg_logprob || -1;
      
      console.log('Transcription confidence:', confidence);
      
      if (!transcribedText || transcribedText.trim() === '') {
        return NextResponse.json({ 
          text: 'Речь не распознана. Попробуйте говорить громче и четче.',
          success: false
        });
      }
      
      // Check for common hallucinations
      const commonHallucinations = [
        'спасибо за просмотр',
        'спасибо за внимание',
        'подписывайтесь на канал',
        'like and subscribe',
        'музыка',
        'субтитры',
        'переводчик',
        'Thank you'
      ];
      
      const isLikelyHallucination = commonHallucinations.some(phrase => 
        transcribedText.toLowerCase().includes(phrase.toLowerCase())
      );
      
      if (isLikelyHallucination || confidence < -0.8) {
        return NextResponse.json({ 
          text: 'Не удалось четко распознать речь. Попробуйте сказать еще раз более четко.',
          success: false,
          debug: { confidence, text: transcribedText }
        });
      }

      return NextResponse.json({ 
        text: transcribedText.trim(),
        success: true,
        confidence 
      });

    } catch (openaiError: unknown) {
      const error = openaiError as OpenAIError;
      console.error('OpenAI Whisper detailed error:', {
        message: error.message,
        type: error.type,
        code: error.code,
        status: error.status,
        stack: error.stack
      });
      
      let errorMessage = 'Ошибка распознавания речи.';
      
      if (error.code === 'invalid_api_key') {
        errorMessage = 'Неверный API ключ OpenAI.';
      } else if (error.code === 'insufficient_quota') {
        errorMessage = 'Превышена квота OpenAI API.';
      } else if (error.message?.includes('audio')) {
        errorMessage = 'Неподдерживаемый формат аудио. Попробуйте еще раз.';
      }
      
      return NextResponse.json({ 
        text: errorMessage,
        success: false,
        error: error.message,
        code: error.code
      });
    }

  } catch (error: unknown) {
    const generalError = error as Error;
    console.error('Speech transcription general error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio', 
        details: generalError.message,
        text: 'Общая ошибка сервера. Попробуйте позже.',
        success: false
      },
      { status: 500 }
    );
  }
} 