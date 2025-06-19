import { NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const telegramId = searchParams.get('telegram_id');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;
    
    let query = supabaseServer
      .from('chat_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    
    if (telegramId) {
      query = query.eq('telegram_id', telegramId);
    }
    
    const { data: messages, error } = await query;
    
    if (error) throw error;
    
    // Get unique user IDs
    const userIds = [...new Set((messages || []).map(msg => msg.telegram_id))];
    
    // Fetch user info
    if (userIds.length > 0) {
      const { data: users } = await supabaseServer
        .from('tg_users')
        .select('telegram_id, username, first_name, last_name, photo_url')
        .in('telegram_id', userIds);
      
      // Merge user info with messages
      const userMap = new Map();
      users?.forEach(user => {
        userMap.set(user.telegram_id, user);
      });
      
      const messagesWithUsers = (messages || []).map(msg => ({
        ...msg,
        tg_users: userMap.get(msg.telegram_id) || null
      }));
      
      return NextResponse.json(messagesWithUsers);
    }
    
    return NextResponse.json(messages || []);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseServer
      .from('chat_history')
      .insert(body)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating chat history entry:', error);
    return NextResponse.json(
      { error: 'Failed to create chat history entry' },
      { status: 500 }
    );
  }
}