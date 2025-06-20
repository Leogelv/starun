import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ session_id: string }> }
) {
  try {
    const params = await context.params;
    const sessionId = params.session_id;

    const { error } = await supabaseServer
      .from('chat_history')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}