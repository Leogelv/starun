import { NextResponse } from "next/server";
import {supabase} from "@/fsd/shared/clients/supabaseClient";
import { UpdateData } from '@/types/openai';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const { avatar_url, first_name, last_name, username } = body;

        console.log('Updating user:', id, body);

        // Check if user exists
        const { data: existingUser, error: selectError } = await supabase
            .from("tg_users")
            .select("*")
            .eq('telegram_id', id)
            .single();

        if (selectError && selectError.code !== 'PGRST116') {
            return NextResponse.json({ error: selectError.message }, { status: 500 });
        }

        if (!existingUser) {
            // User doesn't exist, create new one
            const { data, error } = await supabase
                .from("tg_users")
                .insert({
                    telegram_id: parseInt(id),
                    first_name,
                    last_name,
                    username,
                    avatar_url,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating user:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json(data);
        } else {
            // User exists, update
            const updateData: UpdateData = {
                updated_at: new Date().toISOString()
            };

            if (avatar_url) updateData.avatar_url = avatar_url;
            if (first_name) updateData.first_name = first_name;
            if (last_name) updateData.last_name = last_name;
            if (username) updateData.username = username;

            const { data, error } = await supabase
                .from("tg_users")
                .update(updateData)
                .eq('telegram_id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating user:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json(data);
        }

    } catch (error) {
        console.error('User update error:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
