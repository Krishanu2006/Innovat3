import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContract } from '../blockchain/contract'

interface Donation {
  donor: string
  amount: bigint
  timestamp: bigint
}

interface Props {
  campaignId: number
}

const DonationList = ({ campaignId }: Props) => {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDonations = async () => {
    setLoading(true)
    try {
      const contract = await getContract()
      const data = await contract.getDonations(campaignId)
      setDonations(data)
    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDonations()
  }, [campaignId])

  if (loading) return <p>Loading donations...</p>

  return (
    <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
      <h4>Donations ({donations.length})</h4>
      {donations.length === 0 ? (
        <p>No donations yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {donations.map((d, idx) => (
            <li key={idx} style={{ borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
              <p><strong>Donor:</strong> {d.donor.slice(0,6)}...{d.donor.slice(-4)}</p>
              <p><strong>Amount:</strong> {ethers.formatEther(d.amount)} ETH</p>
              <p><strong>Time:</strong> {new Date(Number(d.timestamp) * 1000).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DonationList