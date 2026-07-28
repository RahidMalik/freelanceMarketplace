'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/sonner'

type Job = {
    id: string
    client_id: string
    title: string
    budget: number
    status: string
}

type Bid = {
    id: string
    freelancer_id: string
    bid_amount: number
    proposal: string
    status: string
    created_at: string
    profiles: { full_name: string } | null
}

export default function BidsPage() {
    const { jobId } = useParams<{ jobId: string }>()
    const supabase = createClient()

    const [job, setJob] = useState<Job | null>(null)
    const [bids, setBids] = useState<Bid[]>([])
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Bid form state
    const [bidAmount, setBidAmount] = useState('')
    const [proposal, setProposal] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [alreadyBid, setAlreadyBid] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id ?? null)

            // Fetch job
            const { data: jobData } = await supabase
                .from('jobs')
                .select('*')
                .eq('id', jobId)
                .single()
            setJob(jobData)

            // If current user is the client (job owner), fetch all bids
            if (jobData && user && jobData.client_id === user.id) {
                const { data: bidsData } = await supabase
                    .from('bids')
                    .select('*, profiles(full_name)')
                    .eq('job_id', jobId)
                    .order('created_at', { ascending: false })

                setBids(bidsData ?? [])
            }

            // Check if current user (freelancer) already bid on this job
            if (jobData && user && jobData.client_id !== user.id) {
                const { data: existingBid } = await supabase
                    .from('bids')
                    .select('id')
                    .eq('job_id', jobId)
                    .eq('freelancer_id', user.id)
                    .maybeSingle()

                setAlreadyBid(!!existingBid)
            }

            setLoading(false)
        }

        fetchData()
    }, [jobId])

    const handleSubmitBid = async (e: React.FormEvent) => {
        e.preventDefault()

        const amount = parseFloat(bidAmount)
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid bid amount.')
            return
        }

        if (proposal.trim().length < 10) {
            toast.error('Proposal must be at least 10 characters.')
            return
        }

        setSubmitting(true)

        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setSubmitting(false)
            toast.error('You must be logged in to bid.')
            return
        }

        const { error } = await supabase.from('bids').insert({
            job_id: jobId,
            freelancer_id: user.id,
            bid_amount: amount,
            proposal: proposal.trim(),
        })

        setSubmitting(false)

        if (error) {
            toast.error(error.message)
            return
        }

        toast.success('Bid submitted successfully!')
        setAlreadyBid(true)
        setBidAmount('')
        setProposal('')
    }

    const handleBidStatusChange = async (bidId: string, status: 'accepted' | 'rejected') => {
        const { error } = await supabase
            .from('bids')
            .update({ status })
            .eq('id', bidId)

        if (error) {
            toast.error(error.message)
            return
        }

        toast.success(`Bid ${status}!`)
        setBids((prev) =>
            prev.map((bid) => (bid.id === bidId ? { ...bid, status } : bid))
        )
    }

    if (loading) return <p className="mt-10 text-center text-muted-foreground">Loading...</p>
    if (!job) return <p className="mt-10 text-center text-muted-foreground">Job not found.</p>

    const isOwner = job.client_id === currentUserId

    return (
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Job Summary */}
            <div className="mb-6 rounded-xl border bg-background p-5 shadow-sm">
                <h1 className="text-xl font-semibold text-primary">{job.title}</h1>
                <p className="text-sm text-muted-foreground">Budget: ${job.budget}</p>
            </div>

            {/* CLIENT VIEW: All Bids */}
            {isOwner && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Bids Received ({bids.length})</h2>

                    {bids.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No bids yet.</p>
                    ) : (
                        bids.map((bid) => (
                            <div key={bid.id} className="rounded-xl border bg-background p-4 shadow-sm">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-medium">
                                        {bid.profiles?.full_name ?? 'Freelancer'}
                                    </span>
                                    <Badge
                                        variant={
                                            bid.status === 'accepted'
                                                ? 'default'
                                                : bid.status === 'rejected'
                                                    ? 'destructive'
                                                    : 'secondary'
                                        }
                                    >
                                        {bid.status}
                                    </Badge>
                                </div>

                                <p className="mb-2 text-sm text-muted-foreground">{bid.proposal}</p>
                                <p className="mb-3 font-semibold text-primary">${bid.bid_amount}</p>

                                {bid.status === 'pending' && (
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleBidStatusChange(bid.id, 'accepted')}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleBidStatusChange(bid.id, 'rejected')}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* FREELANCER VIEW: Bid Form */}
            {!isOwner && (
                <div className="rounded-xl border bg-background p-5 shadow-sm">
                    {alreadyBid ? (
                        <p className="text-center text-sm text-muted-foreground">
                            You have already submitted a bid for this job.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmitBid} className="space-y-4">
                            <h2 className="text-lg font-semibold">Place Your Bid</h2>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Bid Amount (USD)</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 300"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    min="1"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Proposal</label>
                                <Textarea
                                    placeholder="Explain why you're a good fit for this job..."
                                    value={proposal}
                                    onChange={(e) => setProposal(e.target.value)}
                                    rows={5}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit Bid'}
                            </Button>
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}