import { NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('include_count') === 'true';
    
    const query = supabaseServer
      .from('subtopics')
      .select('*')
      .order('name', { ascending: true });
    
    const { data: subtopics, error } = await query;
    
    if (error) throw error;
    
    if (includeCount) {
      // Get material counts for each subtopic
      const subtopicsWithCount = await Promise.all(
        subtopics.map(async (subtopic) => {
          const { count, error: countError } = await supabaseServer
            .from('materials')
            .select('id', { count: 'exact' })
            .eq('subtopic_id', subtopic.id);
          
          if (countError) {
            console.error('Error counting materials for subtopic:', subtopic.id, countError);
            return { ...subtopic, material_count: 0 };
          }
          
          return { ...subtopic, material_count: count || 0 };
        })
      );
      
      return NextResponse.json(subtopicsWithCount);
    }
    
    return NextResponse.json(subtopics);
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
    
    // Check for duplicate name
    const { data: existing, error: checkError } = await supabaseServer
      .from('subtopics')
      .select('id')
      .eq('name', body.name)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existing) {
      return NextResponse.json(
        { error: 'Subtopic with this name already exists' },
        { status: 409 }
      );
    }
    
    const { data, error } = await supabaseServer
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