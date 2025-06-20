import { NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subtopicId = searchParams.get('subtopic_id');
    
    let query = supabaseServer
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (subtopicId) {
      query = query.eq('subtopic_id', subtopicId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching materials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabaseServer
      .from('materials')
      .insert(body)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating material:', error);
    return NextResponse.json(
      { error: 'Failed to create material' },
      { status: 500 }
    );
  }
}