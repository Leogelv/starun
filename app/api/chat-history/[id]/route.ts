import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const messageId = parseInt(params.id);

    const { error } = await supabaseServer
      .from('chat_history')
      .delete()
      .eq('id', messageId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}