import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegram_id, question, session_id } = body;

    console.log('Chat API received:', { telegram_id, question, session_id });

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Make request to external AI service
    const webhookUrl = process.env.WEBHOOK_AI_URL || 'https://primary-production-ee24.up.railway.app/webhook/get_rec';
    console.log('Making request to:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        telegram_id: telegram_id || 123456789,
        question: question,
      }),
    });

    console.log('External API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      throw new Error(`External API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('External API response data:', data);
    
    // Save chat history to database
    try {
      const sessionId = session_id || crypto.randomUUID();
      
      // Save user message
      console.log('Saving user message to chat_history:', {
        telegram_id: telegram_id || 123456789,
        message_type: 'user',
        content: question,
        session_id: sessionId
      });

      const { data: userInsert, error: userError } = await supabaseServer
        .from('chat_history')
        .insert({
          telegram_id: telegram_id || 123456789,
          message_type: 'user',
          content: question,
          session_id: sessionId
        })
        .select();

      if (userError) {
        console.error('Error saving user message:', userError);
        throw userError;
      }
      
      console.log('User message saved successfully:', userInsert);

      // Extract material IDs and comment from response
      let materialIds: number[] = [];
      let assistantComment = '';
      
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        try {
          const outputData = JSON.parse(data[0].output);
          if (outputData.results && Array.isArray(outputData.results)) {
            materialIds = outputData.results;
          }
          if (outputData.comment) {
            assistantComment = outputData.comment;
          }
        } catch (parseError) {
          console.error('Failed to parse AI output for history:', parseError);
        }
      }

      const finalComment = assistantComment || 
        (materialIds.length > 0 
          ? `Я нашел ${materialIds.length} ${materialIds.length === 1 ? 'практику' : 'практики'} для вас:`
          : 'Не удалось найти подходящие практики по вашему запросу.');

      // Save assistant response
      console.log('Saving assistant message to chat_history:', {
        telegram_id: telegram_id || 123456789,
        message_type: 'assistant',
        content: finalComment,
        material_ids: materialIds.length > 0 ? materialIds : null,
        session_id: sessionId
      });

      const { data: assistantInsert, error: assistantError } = await supabaseServer
        .from('chat_history')
        .insert({
          telegram_id: telegram_id || 123456789,
          message_type: 'assistant',
          content: finalComment,
          material_ids: materialIds.length > 0 ? materialIds : null,
          session_id: sessionId
        })
        .select();

      if (assistantError) {
        console.error('Error saving assistant message:', assistantError);
        throw assistantError;
      }

      console.log('Assistant message saved successfully:', assistantInsert);
      console.log('Chat history saved successfully');
    } catch (historyError) {
      console.error('Failed to save chat history:', historyError);
      // Don't fail the whole request if history saving fails
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}