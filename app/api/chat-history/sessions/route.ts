import { NextResponse } from 'next/server';
import { supabase } from '@/fsd/shared/clients/supabaseClient';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const telegramId = searchParams.get('telegram_id');
    
    const offset = (page - 1) * limit;
    
    // Get recent chat sessions using the view
    let query = supabase
      .from('recent_chat_sessions')
      .select('*')
      .range(offset, offset + limit - 1);
    
    if (telegramId) {
      query = query.eq('telegram_id', telegramId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Get total count
    let countQuery = supabase
      .from('recent_chat_sessions')
      .select('*', { count: 'exact', head: true });
    
    if (telegramId) {
      countQuery = countQuery.eq('telegram_id', telegramId);
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
    console.error('Error fetching chat sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' },
      { status: 500 }
    );
  }
}