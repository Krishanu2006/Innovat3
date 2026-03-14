import { useState } from 'react'
import { getContract } from '../blockchain/contract'

interface Props {
  campaignId: number
  owner: string
  currentAccount: string
  onWithdrawSuccess: () => void
}

const WithdrawButton = ({ campaignId, owner, currentAccount, onWithdrawSuccess }: Props) => {
  const [loading, setLoading]       = useState(false)
  const [confirming, setConfirming] = useState(false)

  if (owner.toLowerCase() !== currentAccount.toLowerCase()) {
    return null
  }

  const handleWithdraw = async () => {
    if (!confirming) {
      setConfirming(true)
      return
    }

    setConfirming(false)
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

  const handleCancel = () => setConfirming(false)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        .wd-wrap {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Syne', sans-serif;
        }

        .wd-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, opacity 0.2s;
        }

        .wd-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Default state */
        .wd-btn--default {
          color: #e05a5a;
          background: rgba(224,90,90,0.08);
          border: 1px solid rgba(224,90,90,0.22);
        }

        .wd-btn--default:hover:not(:disabled) {
          background: rgba(224,90,90,0.14);
          border-color: rgba(224,90,90,0.4);
          transform: translateY(-1px);
        }

        /* Confirm state */
        .wd-btn--confirm {
          color: #080c14;
          background: #e05a5a;
          border: 1px solid #e05a5a;
        }

        .wd-btn--confirm:hover:not(:disabled) {
          background: #f07070;
          transform: translateY(-1px);
        }

        /* Cancel */
        .wd-cancel {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: rgba(123,164,187,0.7);
          background: none;
          border: 1px solid rgba(99,210,255,0.12);
          border-radius: 8px;
          padding: 10px 14px;
          cursor: pointer;
          letter-spacing: 0.05em;
          transition: border-color 0.2s, color 0.2s;
        }

        .wd-cancel:hover {
          border-color: rgba(99,210,255,0.25);
          color: #7ba4bb;
        }

        .wd-warn {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(224,90,90,0.65);
          letter-spacing: 0.04em;
        }

        .wd-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(224,90,90,0.2);
          border-top-color: #e05a5a;
          border-radius: 50%;
          animation: wd-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes wd-spin { to { transform: rotate(360deg); } }

        .wd-stack {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: flex-start;
        }
      `}</style>

      <div className="wd-stack">
        <div className="wd-wrap">
          <button
            className={`wd-btn ${confirming ? 'wd-btn--confirm' : 'wd-btn--default'}`}
            onClick={handleWithdraw}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="wd-spinner" />
                Withdrawing...
              </>
            ) : confirming ? (
              '⚠ Confirm Withdrawal'
            ) : (
              '↑ Withdraw Funds'
            )}
          </button>

          {confirming && !loading && (
            <button className="wd-cancel" onClick={handleCancel}>
              Cancel
            </button>
          )}
        </div>

        {confirming && (
          <span className="wd-warn">This will withdraw all funds to your wallet.</span>
        )}
      </div>
    </>
  )
}

export default WithdrawButton
