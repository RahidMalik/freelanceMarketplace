'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/sonner'

export default function PostJobPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [budget, setBudget] = useState('')
    const [loading, setLoading] = useState(false)

    const supabase = createClient()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Basic validation
        if (title.trim().length < 5) {
            toast.error('Title must be at least 5 characters long.')
            return
        }

        if (description.trim().length < 20) {
            toast.error('Description must be at least 20 characters long.')
            return
        }

        const budgetValue = parseFloat(budget)
        if (isNaN(budgetValue) || budgetValue <= 0) {
            toast.error('Please enter a valid budget amount.')
            return
        }

        setLoading(true)

        // Get currently logged-in user
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            setLoading(false)
            toast.error('You must be logged in to post a job.')
            return
        }

        // Insert job into database
        const { error } = await supabase.from('jobs').insert({
            client_id: user.id,
            title: title.trim(),
            description: description.trim(),
            budget: budgetValue,
        })

        setLoading(false)

        if (error) {
            toast.error(error.message)
            return
        }

        toast.success('Job posted successfully!')
        router.push('/jobs')
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-lg rounded-xl border bg-background p-6 sm:p-8 shadow-sm">
                <h1 className="mb-1 text-2xl font-semibold text-primary">Post a Job</h1>
                <p className="mb-6 text-sm text-muted-foreground">
                    Describe what you need done and freelancers will start bidding.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Job Title</label>
                        <Input
                            placeholder="e.g. Enter title."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Description</label>
                        <Textarea
                            placeholder="Describe the job in detail — scope, requirements, timeline..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={6}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Budget (USD - PKR)</label>
                        <Input
                            type="number"
                            placeholder="e.g. Enter Budget"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            min="1"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Posting...' : 'Post Job'}
                    </Button>
                </form>
            </div>
        </div>
    )
}