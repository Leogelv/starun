import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ telegram_id: string }> }
) {
  try {
    const params = await context.params;
    const telegram_id = parseInt(params.telegram_id);
    
    // Get all messages for this user
    const { data: messages, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('telegram_id', telegram_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Group messages by session
    const sessionMap = new Map<string, {
      session_id: string;
      last_message: string;
      created_at: string;
      message_count: number;
    }>();

    messages?.forEach((msg) => {
      const sessionId = msg.session_id;
      
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          session_id: sessionId,
          last_message: '',
          created_at: msg.created_at,
          message_count: 0
        });
      }
      
      const session = sessionMap.get(sessionId)!;
      session.message_count++;
      
      // Update last user message and timestamp
      if (msg.message_type === 'user') {
        if (!session.last_message || new Date(msg.created_at) > new Date(session.created_at)) {
          session.last_message = msg.content;
          session.created_at = msg.created_at;
        }
      }
    });

    // Convert to array and sort by most recent
    const sessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10); // Return only last 10 sessions for popup

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching session summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session summary' },
      { status: 500 }
    );
  }
}