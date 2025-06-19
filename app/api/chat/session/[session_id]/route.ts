import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { session_id: string } }
) {
  try {
    const session_id = params.session_id;
    
    const { data: messages, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json(messages || []);
  } catch (error) {
    console.error('Error fetching session messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}