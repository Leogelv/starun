import { NextResponse } from "next/server";
import { supabase } from "@/fsd/shared/clients/supabaseClient";

export async function POST(request: Request) {
    try {
        const { ids } = await request.json();
        
        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }
        
        const { data, error } = await supabase
            .from("meditation_materials")
            .select("*")
            .in('id', ids);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 