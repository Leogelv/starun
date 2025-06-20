import { NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function GET() {
  try {
    console.log('Testing chat_history table...');
    
    // Test if table exists by trying to select from it
    const { data, error } = await supabaseServer
      .from('chat_history')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing chat_history table:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      });
    }
    
    console.log('Table exists, found records:', data?.length || 0);
    
    // Try to insert a test record
    const testRecord = {
      telegram_id: 999999999,
      message_type: 'user',
      content: 'Test message',
      session_id: crypto.randomUUID()
    };
    
    const { data: insertData, error: insertError } = await supabaseServer
      .from('chat_history')
      .insert(testRecord)
      .select();
    
    if (insertError) {
      console.error('Error inserting test record:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Insert failed: ' + insertError.message,
        details: insertError
      });
    }
    
    console.log('Test record inserted successfully:', insertData);
    
    // Clean up test record
    if (insertData && insertData[0]) {
      await supabaseServer
        .from('chat_history')
        .delete()
        .eq('id', insertData[0].id);
    }
    
    return NextResponse.json({
      success: true,
      message: 'chat_history table is working correctly',
      existingRecords: data?.length || 0
    });
    
  } catch (error) {
    console.error('Test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: error
    });
  }
}