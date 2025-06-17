import {supabase} from "@/fsd/shared/clients/supabaseClient";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
    const res = await request.json()
    const { data, error } = await supabase.from("tg_users").upsert({...res}, { onConflict: 'telegram_id' }).select();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0]);
}
