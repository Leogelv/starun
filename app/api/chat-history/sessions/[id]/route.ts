import { NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.id;
    
    // Delete all messages in the session
    const { error } = await supabaseServer
      .from('chat_history')
      .delete()
      .eq('session_id', sessionId);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}