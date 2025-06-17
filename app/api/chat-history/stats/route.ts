import { NextResponse } from 'next/server';
import { supabase } from '@/fsd/shared/clients/supabaseClient';

export async function GET() {
  try {
    // Get user chat statistics using the view
    const { data: userStats, error: userStatsError } = await supabase
      .from('user_chat_stats')
      .select('*')
      .order('total_messages', { ascending: false })
      .limit(50);
    
    if (userStatsError) throw userStatsError;
    
    // Get overall statistics
    const { data: totalMessages, error: totalError } = await supabase
      .from('chat_history')
      .select('*', { count: 'exact', head: true });
    
    if (totalError) throw totalError;
    
    const { data: totalUsers, error: usersError } = await supabase
      .rpc('count_distinct_users');
    
    if (usersError) {
      console.error('Error counting users:', usersError);
    }
    
    // Get messages per day for the last 30 days
    const { data: dailyStats, error: dailyError } = await supabase
      .from('chat_history')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (dailyError) throw dailyError;
    
    // Process daily statistics
    const dailyStatsProcessed = dailyStats?.reduce((acc: Record<string, number>, message) => {
      const date = new Date(message.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};
    
    return NextResponse.json({
      userStats,
      overallStats: {
        totalMessages: totalMessages?.length || 0,
        totalUsers: totalUsers || 0,
        dailyStats: dailyStatsProcessed
      }
    });
  } catch (error) {
    console.error('Error fetching chat statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat statistics' },
      { status: 500 }
    );
  }
}