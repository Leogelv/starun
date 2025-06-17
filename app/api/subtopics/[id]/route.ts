import { NextResponse } from 'next/server';
import { supabase } from '@/fsd/shared/clients/supabaseClient';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('subtopics')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Subtopic not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching subtopic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subtopic' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id, created_at, ...updateData } = body; // Remove non-updatable fields
    
    // Check for duplicate name
    const { data: existing, error: checkError } = await supabase
      .from('subtopics')
      .select('id')
      .eq('name', updateData.name)
      .neq('id', params.id)
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
    
    const { data, error } = await supabase
      .from('subtopics')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Subtopic not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating subtopic:', error);
    return NextResponse.json(
      { error: 'Failed to update subtopic' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if subtopic has materials
    const { data: materials, error: checkError } = await supabase
      .from('materials')
      .select('id')
      .eq('subtopic_id', params.id)
      .limit(1);
    
    if (checkError) throw checkError;
    
    if (materials && materials.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete subtopic that contains materials' },
        { status: 409 }
      );
    }
    
    const { error } = await supabase
      .from('subtopics')
      .delete()
      .eq('id', params.id);
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subtopic:', error);
    return NextResponse.json(
      { error: 'Failed to delete subtopic' },
      { status: 500 }
    );
  }
}