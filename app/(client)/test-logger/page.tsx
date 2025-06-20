'use client';

import { useState } from 'react';
import { logger } from '@/fsd/shared/utils/logger';

export default function TestLoggerPage() {
  const [results, setResults] = useState<string[]>([]);

  const testLogger = async () => {
    const newResults: string[] = [];
    
    try {
      // Тест info
      newResults.push('Testing info log...');
      await logger.info('Test info message from client', { 
        timestamp: new Date().toISOString(),
        page: 'test-logger' 
      }, '123456789', 'test-session-001');
      
      // Тест warning
      newResults.push('Testing warning log...');
      await logger.warn('Test warning from client', {
        warning: 'This is a test warning',
        severity: 'medium'
      }, '123456789', 'test-session-001');
      
      // Тест error
      newResults.push('Testing error log...');
      const testError = new Error('This is a test error');
      await logger.error('Test error from client', testError, {
        context: 'Testing error logging',
        additionalInfo: 'Some extra data'
      }, '123456789', 'test-session-001');
      
      // Тест React error
      newResults.push('Testing React error log...');
      await logger.reactError(
        new Error('Test React component error'),
        { componentStack: 'TestComponent > ErrorBoundary > App' },
        { component: 'TestLoggerPage' },
        '123456789',
        'test-session-001'
      );
      
      newResults.push('✅ All tests completed! Check console and Supabase logs table.');
    } catch (error) {
      newResults.push(`❌ Error during testing: ${error}`);
    }
    
    setResults(newResults);
  };

  const triggerClientError = () => {
    try {
      // Намеренно вызываем ошибку
      throw new Error('Intentional client-side error for testing');
    } catch (error) {
      logger.error('Caught intentional error', error as Error, {
        triggered: 'manually',
        purpose: 'testing'
      }, '123456789', 'test-error-session');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Logger Test Page</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testLogger}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Run Logger Tests
          </button>
          
          <button
            onClick={triggerClientError}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Trigger Client Error
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
            <ul className="space-y-2">
              {results.map((result, index) => (
                <li key={index} className="text-sm font-mono">
                  {result}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 bg-yellow-900/50 border border-yellow-600 rounded-lg p-4">
          <p className="text-sm">
            <strong>Note:</strong> Check the browser console for detailed logs and 
            the Supabase `logs` table for persisted entries.
          </p>
        </div>
      </div>
    </div>
  );
}