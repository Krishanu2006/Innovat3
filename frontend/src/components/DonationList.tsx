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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        .dl-root {
          font-family: 'Syne', sans-serif;
          margin-top: 20px;
        }

        .dl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }

        .dl-title {
          font-size: 11px;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7ba4bb;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dl-title::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 12px;
          background: #3dd9ff;
          border-radius: 2px;
        }

        .dl-count {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: #3dd9ff;
          background: rgba(61,217,255,0.08);
          border: 1px solid rgba(61,217,255,0.18);
          border-radius: 12px;
          padding: 3px 10px;
        }

        .dl-refresh {
          background: none;
          border: 1px solid rgba(99,210,255,0.18);
          border-radius: 6px;
          color: #7ba4bb;
          font-size: 12px;
          cursor: pointer;
          padding: 5px 10px;
          transition: border-color 0.2s, color 0.2s;
          font-family: 'Space Mono', monospace;
        }

        .dl-refresh:hover {
          border-color: rgba(61,217,255,0.4);
          color: #3dd9ff;
        }

        /* Loading */
        .dl-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 24px 0;
          color: #7ba4bb;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
        }

        .dl-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(61,217,255,0.15);
          border-top-color: #3dd9ff;
          border-radius: 50%;
          animation: dl-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes dl-spin { to { transform: rotate(360deg); } }

        /* Empty */
        .dl-empty {
          padding: 28px 0;
          text-align: center;
          color: rgba(123,164,187,0.5);
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          border: 1px dashed rgba(99,210,255,0.1);
          border-radius: 10px;
        }

        /* List */
        .dl-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .dl-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 10px;
          padding: 12px 16px;
          display: grid;
          grid-template-columns: 1fr auto;
          grid-template-rows: auto auto;
          gap: 4px 12px;
          align-items: center;
          transition: border-color 0.2s, background 0.2s;
        }

        .dl-item:hover {
          border-color: rgba(61,217,255,0.2);
          background: rgba(61,217,255,0.03);
        }

        .dl-donor {
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          color: #e8f4fb;
          grid-column: 1;
          grid-row: 1;
        }

        .dl-time {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(123,164,187,0.6);
          grid-column: 1;
          grid-row: 2;
        }

        .dl-amount {
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #22d3a5;
          grid-column: 2;
          grid-row: 1 / 3;
          text-align: right;
          white-space: nowrap;
        }

        .dl-amount-unit {
          font-size: 10px;
          color: rgba(34,211,165,0.6);
          font-weight: 400;
          margin-left: 3px;
        }

        .dl-index {
          display: inline-block;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(61,217,255,0.08);
          border: 1px solid rgba(61,217,255,0.15);
          font-size: 9px;
          font-family: 'Space Mono', monospace;
          color: #7ba4bb;
          text-align: center;
          line-height: 20px;
          margin-right: 8px;
          flex-shrink: 0;
        }
      `}</style>

      <div className="dl-root">
        <div className="dl-header">
          <span className="dl-title">
            Donations
            <span className="dl-count">{donations.length}</span>
          </span>
          <button className="dl-refresh" onClick={fetchDonations}>↻ Refresh</button>
        </div>

        {loading ? (
          <div className="dl-loading">
            <div className="dl-spinner" />
            Fetching on-chain data...
          </div>
        ) : donations.length === 0 ? (
          <div className="dl-empty">◎ No donations yet</div>
        ) : (
          <ul className="dl-list">
            {donations.map((d, idx) => (
              <li key={idx} className="dl-item">
                <div className="dl-donor">
                  <span className="dl-index">{idx + 1}</span>
                  {d.donor.slice(0, 6)}...{d.donor.slice(-4)}
                </div>
                <div className="dl-time">
                  {new Date(Number(d.timestamp) * 1000).toLocaleString()}
                </div>
                <div className="dl-amount">
                  {ethers.formatEther(d.amount)}
                  <span className="dl-amount-unit">ETH</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default DonationList
