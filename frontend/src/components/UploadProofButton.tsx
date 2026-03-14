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
  const [fileName, setFileName]   = useState<string | null>(null)

  if (owner.toLowerCase() !== currentAccount.toLowerCase()) {
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
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
      setFileName(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        .up-wrap {
          font-family: 'Syne', sans-serif;
          display: inline-flex;
          flex-direction: column;
          gap: 8px;
        }

        .up-label {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #22d3a5;
          background: rgba(34,211,165,0.08);
          border: 1px solid rgba(34,211,165,0.25);
          border-radius: 8px;
          padding: 10px 18px;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
          user-select: none;
        }

        .up-label:hover:not(.up-label--disabled) {
          background: rgba(34,211,165,0.14);
          border-color: rgba(34,211,165,0.45);
          transform: translateY(-1px);
        }

        .up-label--disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .up-icon {
          font-size: 15px;
          line-height: 1;
        }

        .up-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(34,211,165,0.2);
          border-top-color: #22d3a5;
          border-radius: 50%;
          animation: up-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes up-spin { to { transform: rotate(360deg); } }

        .up-filename {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(123,164,187,0.6);
          padding-left: 4px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .up-hint {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(123,164,187,0.45);
          padding-left: 4px;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="up-wrap">
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          disabled={uploading}
          id={`file-${campaignId}`}
          style={{ display: 'none' }}
        />

        <label
          htmlFor={`file-${campaignId}`}
          className={`up-label${uploading ? ' up-label--disabled' : ''}`}
        >
          {uploading ? (
            <>
              <span className="up-spinner" />
              Uploading to IPFS...
            </>
          ) : (
            <>
              <span className="up-icon">◈</span>
              Upload Proof
            </>
          )}
        </label>

        {fileName && !uploading && (
          <span className="up-filename">↳ {fileName}</span>
        )}

        {!fileName && !uploading && (
          <span className="up-hint">image or PDF · pinned to IPFS</span>
        )}
      </div>
    </>
  )
}

export default UploadProofButton
