
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Job } from "@/types/job"

export default function JobCard({ job }: { job: Job }) {
    return (
        <Link href={`/jobs/${job.id}`}>
            <div className="rounded-xl border bg-background p-5 shadow-sm transition hover:border-primary hover:shadow-md">
                <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{job.title}</h3>
                    <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                        {job.status}
                    </Badge>
                </div>

                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {job.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">${job.budget}</span>
                    <span className="text-xs text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>
        </Link>
    )
}