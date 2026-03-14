import { useState } from 'react'
import { ethers } from 'ethers'
import { getContract } from '../blockchain/contract'

interface Props {
  onCampaignCreated: () => void // callback to refresh campaigns after creation
}

const CreateCampaign = ({ onCampaignCreated }: Props) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !description || !target) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const contract = await getContract()
      const tx = await contract.createCampaign(
        name,
        description,
        ethers.parseEther(target) // convert ETH to wei
      )
      await tx.wait() // wait for transaction confirmation
      alert('Campaign created successfully!')
      // Clear form
      setName('')
      setDescription('')
      setTarget('')
      // Notify parent to refresh
      onCampaignCreated()
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ddd' }}>
      <h2>Create New Campaign</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Campaign Name</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Description</label><br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Target Amount (ETH)</label><br />
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. 5"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Campaign'}
        </button>
      </form>
    </div>
  )
}

export default CreateCampaign