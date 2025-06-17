import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Speech API called');
    
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      console.log('No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('Received audio file:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return NextResponse.json({ 
        text: 'OpenAI API ключ не настроен. Проверьте переменные окружения.',
        success: false,
        error: 'API key missing'
      });
    }

    // Convert webm to a supported format if needed
    try {
      // Create a new File object with proper extension
      const fileName = audioFile.name.endsWith('.webm') ? audioFile.name : 'recording.webm';
      const processedFile = new File([audioFile], fileName, { type: audioFile.type });

      console.log('Sending to OpenAI Whisper:', {
        fileName: processedFile.name,
        type: processedFile.type,
        size: processedFile.size
      });
      
      const transcription = await openai.audio.transcriptions.create({
        file: processedFile,
        model: 'whisper-1',
        language: 'ru',
        response_format: 'verbose_json',
        temperature: 0.0,
        prompt: 'Это запрос о медитации, йоге, практиках осознанности или здоровье.',
      });

      console.log('Transcription successful:', transcription);

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

    } catch (openaiError: any) {
      console.error('OpenAI Whisper detailed error:', {
        message: openaiError.message,
        type: openaiError.type,
        code: openaiError.code,
        status: openaiError.status,
        stack: openaiError.stack
      });
      
      let errorMessage = 'Ошибка распознавания речи.';
      
      if (openaiError.code === 'invalid_api_key') {
        errorMessage = 'Неверный API ключ OpenAI.';
      } else if (openaiError.code === 'insufficient_quota') {
        errorMessage = 'Превышена квота OpenAI API.';
      } else if (openaiError.message?.includes('audio')) {
        errorMessage = 'Неподдерживаемый формат аудио. Попробуйте еще раз.';
      }
      
      return NextResponse.json({ 
        text: errorMessage,
        success: false,
        error: openaiError.message,
        code: openaiError.code
      });
    }

  } catch (error: any) {
    console.error('Speech transcription general error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio', 
        details: error.message,
        text: 'Общая ошибка сервера. Попробуйте позже.',
        success: false
      },
      { status: 500 }
    );
  }
} 