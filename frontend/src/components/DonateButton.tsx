import { useState } from 'react'
import { ethers } from 'ethers'
import { getContract } from '../blockchain/contract'

interface Props {
  campaignId: number
  onDonateSuccess: () => void
}

const DonateButton = ({ campaignId, onDonateSuccess }: Props) => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDonate = async () => {
    if (!amount) return alert('Enter amount')
    setLoading(true)
    try {
      const contract = await getContract()
      const tx = await contract.donate(campaignId, {
        value: ethers.parseEther(amount)
      })
      await tx.wait()
      alert('Donation successful!')
      setAmount('')
      onDonateSuccess() // refresh parent data
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Donation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <input
        type="text"
        placeholder="Amount in ETH"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleDonate} disabled={loading}>
        {loading ? 'Donating...' : 'Donate'}
      </button>
    </div>
  )
}

export default DonateButton