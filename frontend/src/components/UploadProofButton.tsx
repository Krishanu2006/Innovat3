import { useState } from 'react'
import { getContract } from '../blockchain/contract'
import { uploadToIPFS } from '../utils/ipfsUpload'

interface Props {
  campaignId: number
  owner: string
  currentAccount: string
  onUploadSuccess: () => void
}

const UploadProofButton = ({ campaignId, owner, currentAccount, onUploadSuccess }: Props) => {
  const [uploading, setUploading] = useState(false)

  if (owner.toLowerCase() !== currentAccount.toLowerCase()) {
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const ipfsHash = await uploadToIPFS(file)
      const contract = await getContract()
      const tx = await contract.uploadProof(campaignId, ipfsHash)
      await tx.wait()
      alert('Proof uploaded successfully!')
      onUploadSuccess()
    } catch (error) {
      console.error(error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        disabled={uploading}
        id={`file-${campaignId}`}
        style={{ display: 'none' }}
      />
      <label htmlFor={`file-${campaignId}`} style={{ cursor: 'pointer', background: '#4CAF50', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px' }}>
        {uploading ? 'Uploading...' : 'Upload Proof (IPFS)'}
      </label>
    </div>
  )
}

export default UploadProofButton