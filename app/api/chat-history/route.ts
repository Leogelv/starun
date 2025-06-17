import { NextResponse } from 'next/server';
import { supabase } from '@/fsd/shared/clients/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const telegramId = searchParams.get('telegram_id');
    const sessionId = searchParams.get('session_id');
    const messageType = searchParams.get('message_type');
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('chat_history')
      .select(`
        *,
        tg_users (
          username,
          first_name,
          last_name,
          photo_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply filters
    if (telegramId) {
      query = query.eq('telegram_id', telegramId);
    }
    
    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }
    
    if (messageType) {
      query = query.eq('message_type', messageType);
    }
    
    if (search) {
      query = query.ilike('content', `%${search}%`);
    }
    
    console.log('Chat history query:', {
      telegramId, sessionId, messageType, search,
      page, limit, offset
    });
    
    const { data, error } = await query;
    
    console.log('Chat history query result:', { data: data?.length, error });
    
    if (error) {
      console.error('Chat history query error:', error);
      throw error;
    }
    
    // Get total count for pagination
    let countQuery = supabase
      .from('chat_history')
      .select('*', { count: 'exact', head: true });
    
    if (telegramId) {
      countQuery = countQuery.eq('telegram_id', telegramId);
    }
    if (sessionId) {
      countQuery = countQuery.eq('session_id', sessionId);
    }
    if (messageType) {
      countQuery = countQuery.eq('message_type', messageType);
    }
    if (search) {
      countQuery = countQuery.ilike('content', `%${search}%`);
    }
    
    const { count: totalCount } = await countQuery;
    
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });
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
    
    const { data, error } = await supabase
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