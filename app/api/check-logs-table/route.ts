import { NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function GET() {
  try {
    // Проверяем существование таблицы logs
    const { data, error } = await supabaseServer
      .from('logs')
      .select('*')
      .limit(5)
      .order('created_at', { ascending: false });
    
    if (error) {
      // Если таблица не существует, будет ошибка
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return NextResponse.json({
          exists: false,
          error: 'Table "logs" does not exist',
          suggestion: 'You need to create the logs table in Supabase',
          sql: `
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  telegram_id TEXT,
  session_id TEXT,
  level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
  message TEXT NOT NULL,
  error_stack TEXT,
  url TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_logs_telegram_id ON logs(telegram_id);
CREATE INDEX idx_logs_session_id ON logs(session_id);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
          `
        });
      }
      
      return NextResponse.json({
        exists: false,
        error: error.message,
        details: error
      });
    }
    
    return NextResponse.json({
      exists: true,
      message: 'Logs table exists',
      recentLogs: data?.length || 0,
      logs: data
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check logs table',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}