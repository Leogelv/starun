import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface ChatMessage {
  id: number;
  telegram_id: number;
  message_type: 'user' | 'assistant';
  content: string;
  material_ids?: number[];
  session_id: string;
  created_at: string;
  updated_at: string;
}

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
    const { data: messages, error: messagesError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('telegram_id', telegram_id)
      .order('created_at', { ascending: false });

    if (messagesError) {
      throw messagesError;
    }

    // Group messages by session_id
    const sessionMap = new Map<string, {
      session_id: string;
      telegram_id: number;
      created_at: string;
      messages: ChatMessage[];
    }>();
    
    messages?.forEach(msg => {
      const sessionId = msg.session_id;
      
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          session_id: sessionId,
          telegram_id: telegram_id,
          created_at: msg.created_at,
          messages: []
        });
      }
      
      const session = sessionMap.get(sessionId)!;
      session.messages.push(msg);
    });
    
    // Convert to array and sort messages within each session
    const sessionsWithMessages = Array.from(sessionMap.values()).map(session => ({
      ...session,
      messages: session.messages.sort((a: ChatMessage, b: ChatMessage) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    }));

    // Sort sessions by most recent message
    sessionsWithMessages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json(sessionsWithMessages);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}