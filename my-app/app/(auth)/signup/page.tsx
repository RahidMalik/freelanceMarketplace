'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Eye, EyeOff } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import Link from 'next/link'

export default function Signup() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [role, setRole] = useState<'client' | 'freelancer'>('freelancer');
    const [loading, setLoading] = useState<boolean>(false);

    const supabase = createClient();

    // 1. SignUp logic with form validations
    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation Rule 1: Full Name must be between 4 and 20 characters
        const cleanName = fullName.trim();
        if (cleanName.length < 4 || cleanName.length > 20) {
            toast.error('Full name must be between 4 and 20 characters long.');
            return;
        }

        // Validation Rule 2: Email must be a valid @gmail.com address
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(email.trim())) {
            toast.error('Please enter a valid Gmail address (e.g., user@gmail.com).');
            return;
        }

        // Validation Rule 3: Password must be at least 8 characters with at least one special character
        const specialCharRegex = /[@#$%^&*!_\-+]/;
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }

        if (!specialCharRegex.test(password)) {
            toast.error('Password must contain at least one special character (@, #, $, %, etc.).');
            return;
        }

        setLoading(true);

        // Supabase sign-up call
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: cleanName, role }
            },
        });

        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Account created! Check your email to verify.');
            window.location.href = '/login';
        }
    };

    // 2. Google OAuth Logic
    const handleGoogleSignup = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/api/auth/callback`
            }
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-sm rounded-xl border bg-background p-6 sm:p-8 shadow-sm">
                <h1 className="mb-6 text-center sm:text-left text-2xl font-semibold text-primary">
                    Signup
                </h1>

                <form onSubmit={handleSignUp} className='space-y-4'>
                    <Input
                        type='text'
                        placeholder="Enter Your Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />

                    <Input
                        type='email'
                        placeholder='Enter Your Email (@gmail.com)'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className='relative'>
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder='Enter Your Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type='button'
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <Eye className='h-4 w-4 text-gray-400' />
                            ) : (
                                <EyeOff className='h-4 w-4 text-gray-400' />
                            )}
                        </button>
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-medium">I want to join as:</p>
                        <div className='flex gap-2'>
                            <Button
                                type="button"
                                variant={role === 'client' ? 'default' : 'outline'}
                                className="flex-1"
                                onClick={() => setRole('client')}
                            >
                                Client
                            </Button>
                            <Button
                                type="button"
                                variant={role === 'freelancer' ? 'default' : 'outline'}
                                className="flex-1"
                                onClick={() => setRole('freelancer')}
                            >
                                Freelancer
                            </Button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </Button>

                    <Link
                        href='/login'
                        className="text-xs flex justify-center sm:text-sm text-muted-foreground hover:text-primary underline transition-colors"
                    >
                        Already have an account?
                    </Link>

                    <div className="my-4 text-center text-sm text-muted-foreground">or</div>

                    <Button
                        variant="outline"
                        type="button"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleGoogleSignup}
                    >
                        <FcGoogle className="h-5 w-5 shrink-0" />
                        <span>Continue with Google</span>
                    </Button>
                </form>
            </div>
        </div>
    )
}