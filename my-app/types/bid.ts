
export type Bid = {
    id: string
    freelancer_id: string
    bid_amount: number
    proposal: string
    status: string
    created_at: string
    profiles: { full_name: string } | null
}