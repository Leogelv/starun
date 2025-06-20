import { NextResponse } from 'next/server';
import { supabaseServer } from '@/fsd/shared/clients/supabaseServer';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data, error } = await supabaseServer
      .from('subtopics')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return NextResponse.json(
        { error: 'Subtopic not found' },
        { status: 404 }
      );
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: bodyId, created_at, ...updateData } = body; // Remove non-updatable fields
    
    // Check for duplicate name
    const { data: existing, error: checkError } = await supabaseServer
      .from('subtopics')
      .select('id')
      .eq('name', updateData.name)
      .neq('id', id)
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
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check if subtopic has materials
    const { data: materials, error: checkError } = await supabaseServer
      .from('materials')
      .select('id')
      .eq('subtopic_id', id)
      .limit(1);
    
    if (checkError) throw checkError;
    
    if (materials && materials.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete subtopic that contains materials' },
        { status: 409 }
      );
    }
    
    const { error } = await supabaseServer
      .from('subtopics')
      .delete()
      .eq('id', id);
    
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