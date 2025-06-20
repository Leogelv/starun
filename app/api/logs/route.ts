import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseServer;
    const body = await request.json();
    
    const {
      telegram_id,
      session_id,
      level,
      message,
      error_stack,
      url,
      user_agent,
      metadata
    } = body;

    // Валидация обязательных полей
    if (!level || !message) {
      return NextResponse.json(
        { error: 'level and message are required' },
        { status: 400 }
      );
    }

    // Валидация уровня лога
    const validLevels = ['error', 'warn', 'info', 'debug'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: `Invalid level. Must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    // Записываем лог в Supabase
    const { data, error } = await supabase
      .from('logs')
      .insert({
        telegram_id,
        session_id,
        level,
        message,
        error_stack,
        url,
        user_agent: user_agent || request.headers.get('user-agent'),
        metadata,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save log' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, log_id: data.id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 