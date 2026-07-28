import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Check if this user has confirmed their role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role_confirmed')
                .eq('id', data.user.id)
                .single();

            if (!profile?.role_confirmed) {
                // New Google user — send to role selection page
                return NextResponse.redirect(`${origin}/select-role`);
            }

            // Existing user — send to their dashboard (will redirect properly there)
            return NextResponse.redirect(`${origin}/dashboard/redirect`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=Could+not+authenticate+user`);
}