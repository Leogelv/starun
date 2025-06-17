import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { telegram_id, question } = body;

    console.log('Chat API received:', { telegram_id, question });

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
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}