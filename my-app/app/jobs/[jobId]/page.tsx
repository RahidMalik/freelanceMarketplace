
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/sonner'
import { Job } from "@/types/job"
import Link from 'next/link'


export default function JobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>()
    const [job, setJob] = useState<Job | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const fetchJob = async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single()

            if (error) {
                toast.error('Job not found.')
            } else {
                setJob(data)
            }
            setLoading(false)
        }

        fetchJob()
    }, [jobId])

    if (loading) {
        return <p className="mt-10 text-center text-muted-foreground">Loading...</p>
    }

    if (!job) {
        return <p className="mt-10 text-center text-muted-foreground">Job not found.</p>
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-xl border bg-background p-6 shadow-sm">
                <div className="mb-3 flex items-start justify-between">
                    <h1 className="text-2xl font-semibold text-primary">{job.title}</h1>
                    <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                        {job.status}
                    </Badge>
                </div>

                <p className="mb-4 whitespace-pre-line text-muted-foreground">
                    {job.description}
                </p>

                <div className="mb-6 flex items-center justify-between border-t pt-4">
                    <span className="text-lg font-semibold text-primary">${job.budget}</span>
                    <span className="text-xs text-muted-foreground">
                        Posted on {new Date(job.created_at).toLocaleDateString()}
                    </span>
                </div>
                <Link href={`/bids/${job.id}`}>
                    <Button className="w-full">View Bids / Place a Bid</Button>
                </Link>
            </div>
        </div>
    )
}