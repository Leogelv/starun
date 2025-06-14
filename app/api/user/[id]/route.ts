import { NextResponse } from "next/server";
import {supabase} from "@/fsd/shared/clients/supabaseClient";

export async function GET(request: Request,
                          { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data, error } = await supabase.from("tg_users").select("*").eq('telegram_id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data?.length === 0) {
        return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
}
