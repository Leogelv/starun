import { NextResponse } from 'next/server';
import { supabase } from '@/fsd/shared/clients/supabaseClient';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('subtopics')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subtopics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtopics' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('subtopics')
      .insert(body)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating subtopic:', error);
    return NextResponse.json(
      { error: 'Failed to create subtopic' },
      { status: 500 }
    );
  }
}