
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import JobCard from '@/components/job-card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Job } from "@/types/job"

export default function JobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        const fetchJobs = async () => {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false })

            if (!error && data) {
                setJobs(data)
            }
            setLoading(false)
        }

        fetchJobs()
    }, [])

    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-primary">Available Jobs</h1>
                <Link href="/jobs/new">
                    <Button>Post a Job</Button>
                </Link>
            </div>

            {loading ? (
                <p className="text-center text-muted-foreground">Loading jobs...</p>
            ) : jobs.length === 0 ? (
                <p className="text-center text-muted-foreground">No jobs posted yet.</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    )
}