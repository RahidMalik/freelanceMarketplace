'use client'

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { FcGoogle } from "react-icons/fc"

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const supabase = createClient();

    // 1. Login Form submit logic
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation Rule 1: Email must be a valid @gmail.com address
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email.trim())) {
            toast.error('Please enter a valid Gmail address (e.g., user@gmail.com).');
            return;
        }

        // Validation Rule 2: Password must be at least 8 characters long
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }

        // Validation Rule 3: Password must contain at least one special character
        const specialCharRegex = /[@#$%^&*!_\-+]/;
        if (!specialCharRegex.test(password)) {
            toast.error('Password must contain at least one special character (@, #, $, %, etc.).');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setLoading(false);
            toast.error(error.message);
            return;
        }

        // 2. Admin Check (hardcoded email from .env)
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

        if (email.trim().toLowerCase() === adminEmail?.toLowerCase()) {
            toast.success('Welcome Admin!');
            window.location.href = '/admin';
            return;
        }

        // 3. Fetch role from profiles table
        const userId = data.user?.id;
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();

        setLoading(false);

        if (profileError || !profile) {
            toast.error('Could not fetch user role. Please try again.');
            return;
        }

        toast.success('Login successful!');

        // 4. Redirect based on role
        if (profile.role === 'client') {
            window.location.href = '/dashboard/client';
        } else if (profile.role === 'freelancer') {
            window.location.href = '/dashboard/freelancer';
        } else {
            window.location.href = '/dashboard/client'; // fallback
        }
    };

    // 5. Google OAuth Logic
    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/api/auth/callback`
            }
        })
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-sm rounded-xl border bg-background p-6 sm:p-8 shadow-sm">
                <h1 className="mb-6 text-center sm:text-left text-2xl font-semibold text-primary">
                    Login
                </h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Enter Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <Eye className="h-4 w-4" />
                            ) : (
                                <EyeOff className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>
                </form>

                <div className="mt-4 text-center">
                    <Link
                        href="/signup"
                        className="text-xs sm:text-sm text-muted-foreground hover:text-primary underline transition-colors"
                    >
                        Don't have an account?
                    </Link>
                </div>

                <div className="my-4 text-center text-sm text-muted-foreground">or</div>

                <Button
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleGoogleLogin}
                >
                    <FcGoogle className="h-5 w-5 shrink-0" />
                    <span>Continue with Google</span>
                </Button>
            </div>
        </div>
    )
}