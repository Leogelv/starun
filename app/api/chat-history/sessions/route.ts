import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const telegramId = searchParams.get('telegram_id');
    
    const offset = (page - 1) * limit;
    
    // Get all messages to group by session
    const { data: messages, error: messagesError } = await supabase
      .from('chat_history')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (messagesError) throw messagesError;
    
    // Get user info separately
    const userIds = [...new Set(messages?.map(m => m.telegram_id) || [])];
    const { data: users } = await supabase
      .from('tg_users')
      .select('telegram_id, username, first_name, last_name')
      .in('telegram_id', userIds);
    
    const userMap = new Map();
    users?.forEach(user => {
      userMap.set(user.telegram_id, user);
    });
    
    // Group by session_id and get session info
    const sessionMap = new Map();
    
    messages?.forEach(record => {
      const sessionId = record.session_id;
      
      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          session_id: sessionId,
          telegram_id: record.telegram_id,
          username: userMap.get(record.telegram_id)?.username,
          first_name: userMap.get(record.telegram_id)?.first_name,
          last_name: userMap.get(record.telegram_id)?.last_name,
          session_start: record.created_at,
          session_end: record.created_at,
          message_count: 0,
          first_message_preview: ''
        });
      }
      
      const session = sessionMap.get(sessionId);
      session.message_count++;
      
      // Update session time range
      if (new Date(record.created_at) < new Date(session.session_start)) {
        session.session_start = record.created_at;
      }
      if (new Date(record.created_at) > new Date(session.session_end)) {
        session.session_end = record.created_at;
      }
    });
    
    // Get first user message for each session
    for (const [sessionId, sessionInfo] of sessionMap.entries()) {
      const { data: firstMessage } = await supabase
        .from('chat_history')
        .select('content')
        .eq('session_id', sessionId)
        .eq('message_type', 'user')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      if (firstMessage) {
        sessionInfo.first_message_preview = firstMessage.content;
      }
    }
    
    // Convert to array and apply filters
    let sessionsList = Array.from(sessionMap.values());
    
    if (telegramId) {
      sessionsList = sessionsList.filter(s => s.telegram_id.toString() === telegramId);
    }
    
    // Sort by most recent activity
    sessionsList.sort((a, b) => 
      new Date(b.session_end).getTime() - new Date(a.session_end).getTime()
    );
    
    // Paginate
    const totalCount = sessionsList.length;
    const paginatedSessions = sessionsList.slice(offset, offset + limit);
    
    return NextResponse.json({
      data: paginatedSessions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}