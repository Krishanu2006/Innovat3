import { useState } from 'react'
import { getContract } from '../blockchain/contract'

interface Props {
  campaignId: number
  owner: string
  currentAccount: string
  onWithdrawSuccess: () => void
}

const WithdrawButton = ({ campaignId, owner, currentAccount, onWithdrawSuccess }: Props) => {
  const [loading, setLoading] = useState(false)

  if (owner.toLowerCase() !== currentAccount.toLowerCase()) {
    return null // Only owner sees the button
  }

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw all funds?')) return
    setLoading(true)
    try {
      const contract = await getContract()
      const tx = await contract.withdrawFunds(campaignId)
      await tx.wait()
      alert('Funds withdrawn successfully!')
      onWithdrawSuccess()
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Withdrawal failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleWithdraw} disabled={loading} style={{ marginLeft: '1rem' }}>
      {loading ? 'Withdrawing...' : 'Withdraw Funds'}
    </button>
  )
}

export default WithdrawButton