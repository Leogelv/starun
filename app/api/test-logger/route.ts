import { NextResponse } from 'next/server';
import { logger } from '@/fsd/shared/utils/logger';

export async function GET() {
  try {
    // Тестируем разные уровни логирования
    await logger.info('Test info message', { test: true }, 'test_user_123', 'test_session');
    await logger.warn('Test warning message', { warning: 'This is a test' }, 'test_user_123', 'test_session');
    await logger.error('Test error message', new Error('Test error'), { context: 'testing' }, 'test_user_123', 'test_session');
    
    // Тестируем debug (должен работать только в development)
    await logger.debug('Test debug message', { debug: true }, 'test_user_123', 'test_session');

    return NextResponse.json({ 
      success: true, 
      message: 'Logger test completed. Check console and database for logs.',
      note: 'Remember that logger only works on client-side by design. This API test might not create logs.' 
    });
  } catch (error) {
    console.error('Test logger error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}