import { NextRequest, NextResponse } from 'next/server';

const WHISPER_ENDPOINT = 'https://primary-production-ee24.up.railway.app/webhook/whispa';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Speech API POST called ===');
    console.log('🏗️ Proxying to external whisper endpoint');
    
    // Get the form data from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      console.error('❌ No audio file provided');
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

    // Validate file size (25MB limit)
    const maxSize = 25 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      console.error('❌ File too large:', audioFile.size);
      return NextResponse.json({ 
        error: 'File too large',
        success: false,
        text: 'Аудио файл слишком большой. Максимальный размер: 25MB'
      }, { status: 400 });
    }

    // Create new FormData for the external request
    const externalFormData = new FormData();
    
    // Convert File to Blob for the external request
    const arrayBuffer = await audioFile.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: audioFile.type });
    
    // Add the file to FormData with the expected field name
    externalFormData.append('file', blob, audioFile.name);

    console.log('📤 Sending to external Whisper API...');
    
    // Make request to external endpoint
    const response = await fetch(WHISPER_ENDPOINT, {
      method: 'POST',
      body: externalFormData,
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('📥 External API response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type')
    });

    // Get the response text
    const responseText = await response.text();
    console.log('📝 Transcription result:', responseText);

    if (!response.ok) {
      console.error('❌ External API error:', response.status, responseText);
      return NextResponse.json({ 
        text: 'Ошибка распознавания речи. Попробуйте еще раз.',
        success: false,
        error: responseText
      }, { status: response.status });
    }

    // Check if response is empty or just whitespace
    if (!responseText || responseText.trim() === '') {
      return NextResponse.json({ 
        text: 'Речь не распознана. Попробуйте говорить громче и четче.',
        success: false
      });
    }

    // Return the transcribed text
    return NextResponse.json({ 
      text: responseText.trim(),
      success: true
    });

  } catch (error: unknown) {
    console.error('Speech API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to transcribe audio', 
        details: errorMessage,
        text: 'Общая ошибка сервера. Попробуйте позже.',
        success: false
      },
      { status: 500 }
    );
  }
} 