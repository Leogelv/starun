import { NextResponse } from "next/server";
import { supabase } from "@/fsd/shared/clients/supabaseClient";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const subtopicId = searchParams.get('subtopic_id');
        
        let query = supabase
            .from("meditation_materials")
            .select("*");
            
        if (subtopicId) {
            query = query.eq('subtopic_id', subtopicId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 