import {supabase} from "@/fsd/shared/clients/supabaseClient";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
    try {
        console.log('=== POST /api/user called ===');
        
        const res = await request.json();
        console.log('Request body:', res);
        
        if (!res.telegram_id || res.telegram_id <= 0) {
            console.error('❌ Invalid telegram_id:', res.telegram_id);
            return NextResponse.json({ 
                error: 'Invalid telegram_id provided',
                received: res.telegram_id 
            }, { status: 400 });
        }
        
        console.log('📤 Upserting user to Supabase:', res);
        const { data, error } = await supabase
            .from("tg_users")
            .upsert({...res}, { onConflict: 'telegram_id' })
            .select();
            
        if (error) {
            console.error('❌ Supabase error:', error);
            return NextResponse.json({ 
                error: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            }, { status: 500 });
        }

        if (!data || data.length === 0) {
            console.error('❌ No data returned from upsert');
            return NextResponse.json({ 
                error: 'No data returned from database operation' 
            }, { status: 500 });
        }

        console.log('✅ User upserted successfully:', data[0]);
        return NextResponse.json(data[0]);
        
    } catch (error: any) {
        console.error('❌ General error in POST /api/user:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
