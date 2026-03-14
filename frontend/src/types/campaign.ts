export interface Campaign {
  id: number
  name: string
  description: string
  owner: string
  targetAmount: string
  amountRaised: string
  withdrawn: boolean
  proofHash: string
}