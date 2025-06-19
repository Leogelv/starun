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
      .select(`
        *,
        tg_users!chat_history_telegram_id_fkey (
          telegram_id,
          username,
          first_name,
          last_name,
          photo_url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    
    if (telegramId) {
      query = query.eq('telegram_id', telegramId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(data || []);
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