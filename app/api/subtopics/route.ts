import { NextResponse } from "next/server";
import { supabase } from "@/fsd/shared/clients/supabaseClient";

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("subtopics")
            .select("*")
            .order('name');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 