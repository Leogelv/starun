import { NextResponse } from "next/server";
import {supabase} from "@/fsd/shared/clients/supabaseClient";

export async function GET() {
    const { data, error } = await supabase.from("lessons").select("*");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
