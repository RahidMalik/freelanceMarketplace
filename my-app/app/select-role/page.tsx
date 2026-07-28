'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner'
import { useRouter } from 'next/navigation'

export default function SelectRolePage() {
    const supabase = createClient();
    const router = useRouter();

    const selectRole = async (role: 'client' | 'freelancer') => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({ role, role_confirmed: true })
            .eq('id', user.id);

        if (error) {
            toast.error('Something went wrong');
            return;
        }

        toast.success(`Welcome! You're set up as a ${role}.`);
        router.push(role === 'client' ? '/dashboard/client' : '/dashboard/freelancer');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <div className="w-full max-w-sm rounded-xl border bg-background p-8 shadow-sm text-center">
                <h1 className="mb-2 text-2xl font-semibold text-primary">One Last Step</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    How do you want to use the platform?
                </p>

                <div className="flex flex-col gap-3">
                    <Button onClick={() => selectRole('client')}>
                        I'm a Client — I want to hire
                    </Button>
                    <Button variant="outline" onClick={() => selectRole('freelancer')}>
                        I'm a Freelancer — I want to work
                    </Button>
                </div>
            </div>
        </div>
    );
}