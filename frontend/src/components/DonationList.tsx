import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContract } from '../blockchain/contract'
import { motion, AnimatePresence } from 'framer-motion'

interface Donation {
  donor: string
  amount: bigint
  timestamp: bigint
}

interface Props {
  campaignId: number
  proofHash?: string
}

const itemVariant = {
  hidden: { opacity: 0, x: -16, scale: 0.98 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 24 } as const,
  },
  exit: { opacity: 0, x: 12, scale: 0.97, transition: { duration: 0.18 } as const },
} as const;

const listStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const DonationList = ({ campaignId, proofHash }: Props) => {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading]     = useState(false)
  const [justRefreshed, setJustRefreshed] = useState(false)

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

  const handleRefresh = async () => {
    await fetchDonations()
    setJustRefreshed(true)
    setTimeout(() => setJustRefreshed(false), 1200)
  }

  useEffect(() => { fetchDonations() }, [campaignId])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        .dl-root {
          font-family: 'Syne', sans-serif;
          margin-top: 16px;
          width: 100%;
        }

        /* ── Header ── */
        .dl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .dl-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dl-title {
          font-size: 10px;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #7ba4bb;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .dl-title::before {
          content: '';
          display: inline-block;
          width: 2px;
          height: 11px;
          background: #3dd9ff;
          border-radius: 2px;
          flex-shrink: 0;
        }

        .dl-count {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          color: #3dd9ff;
          background: rgba(61,217,255,0.08);
          border: 1px solid rgba(61,217,255,0.18);
          border-radius: 10px;
          padding: 2px 8px;
        }

        /* Refresh button */
        .dl-refresh {
          background: none;
          border: 1px solid rgba(99,210,255,0.15);
          border-radius: 7px;
          color: #7ba4bb;
          font-size: 11px;
          cursor: pointer;
          padding: 5px 11px;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }

        .dl-refresh:hover {
          border-color: rgba(61,217,255,0.35);
          color: #3dd9ff;
          background: rgba(61,217,255,0.05);
        }

        .dl-refresh-icon {
          display: inline-block;
          transition: transform 0.5s ease;
        }

        .dl-refresh-icon.spinning {
          animation: dl-spin-full 0.6s ease;
        }

        @keyframes dl-spin-full { to { transform: rotate(360deg); } }

        .dl-check {
          color: #22d3a5;
          font-size: 12px;
        }

        /* ── Loading ── */
        .dl-loading {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 20px 0;
          color: rgba(123,164,187,0.55);
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.05em;
        }

        .dl-spinner {
          width: 13px; height: 13px;
          border: 1.5px solid rgba(61,217,255,0.12);
          border-top-color: #3dd9ff;
          border-radius: 50%;
          animation: dl-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes dl-spin { to { transform: rotate(360deg); } }

        /* ── Empty ── */
        .dl-empty {
          padding: 24px 0;
          text-align: center;
          color: rgba(123,164,187,0.4);
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          border: 1px dashed rgba(99,210,255,0.09);
          border-radius: 10px;
          letter-spacing: 0.05em;
        }

        /* ── List ── */
        .dl-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* ── Item ── */
        .dl-item {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(99,210,255,0.09);
          border-radius: 10px;
          padding: 11px 14px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          grid-template-rows: auto auto;
          column-gap: 10px;
          row-gap: 3px;
          align-items: center;
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
          width: 100%;
        }

        .dl-item:hover {
          border-color: rgba(61,217,255,0.18);
          background: rgba(61,217,255,0.025);
        }

        /* Index badge */
        .dl-index {
          grid-column: 1;
          grid-row: 1 / 3;
          width: 22px; height: 22px;
          border-radius: 50%;
          background: rgba(61,217,255,0.07);
          border: 1px solid rgba(61,217,255,0.14);
          font-size: 9px;
          font-family: 'Space Mono', monospace;
          color: rgba(61,217,255,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          align-self: center;
        }

        /* Donor */
        .dl-donor {
          grid-column: 2;
          grid-row: 1;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          color: #e8f4fb;
          letter-spacing: 0.02em;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Timestamp */
        .dl-time {
          grid-column: 2;
          grid-row: 2;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(123,164,187,0.5);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* Amount */
        .dl-amount {
          grid-column: 3;
          grid-row: 1 / 3;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          color: #22d3a5;
          text-align: right;
          white-space: nowrap;
          align-self: center;
        }

        .dl-amount-unit {
          font-size: 9px;
          color: rgba(34,211,165,0.55);
          font-weight: 400;
          margin-left: 2px;
        }

        /* Proof row — spans all cols when present */
        .dl-proof-row {
          grid-column: 1 / 4;
          grid-row: 3;
          padding-top: 8px;
          margin-top: 4px;
          border-top: 1px dashed rgba(61,217,255,0.12);
        }

        .dl-proof-link {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: rgba(61,217,255,0.6);
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }

        .dl-proof-link:hover { color: #3dd9ff; }

        .dl-proof-icon {
          width: 10px; height: 10px;
          flex-shrink: 0;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .dl-proof-link:hover .dl-proof-icon { opacity: 1; }

        /* ── Total bar ── */
        .dl-total {
          margin-top: 10px;
          padding: 10px 14px;
          background: rgba(34,211,165,0.05);
          border: 1px solid rgba(34,211,165,0.14);
          border-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: 'Space Mono', monospace;
        }

        .dl-total-label {
          font-size: 10px;
          color: rgba(123,164,187,0.5);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .dl-total-value {
          font-size: 13px;
          font-weight: 700;
          color: #22d3a5;
        }

        .dl-total-unit {
          font-size: 9px;
          color: rgba(34,211,165,0.55);
          font-weight: 400;
          margin-left: 3px;
        }
      `}</style>

      <div className="dl-root">

        {/* Header */}
        <motion.div
          className="dl-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="dl-title-row">
            <span className="dl-title">Donations</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={donations.length}
                className="dl-count"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {donations.length}
              </motion.span>
            </AnimatePresence>
          </div>

          <button className="dl-refresh" onClick={handleRefresh} disabled={loading}>
            <span className={`dl-refresh-icon ${loading ? 'spinning' : ''}`}>
              {justRefreshed ? (
                <span className="dl-check">✓</span>
              ) : (
                '↻'
              )}
            </span>
            Refresh
          </button>
        </motion.div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              className="dl-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="dl-spinner" />
              Fetching on-chain data...
            </motion.div>

          ) : donations.length === 0 ? (
            <motion.div
              key="empty"
              className="dl-empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              ◎ No donations yet
            </motion.div>

          ) : (
            <motion.div key="list">
              <motion.ul
                className="dl-list"
                variants={listStagger}
                initial="hidden"
                animate="show"
              >
                {donations.map((d, idx) => {
                  const hasProof = !!proofHash
                  return (
                    <motion.li
                      key={idx}
                      className="dl-item"
                      variants={itemVariant}
                      style={{ gridTemplateRows: hasProof ? 'auto auto auto' : 'auto auto' }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="dl-index">{idx + 1}</div>

                      <div className="dl-donor">
                        {d.donor.slice(0, 6)}...{d.donor.slice(-4)}
                      </div>

                      <div className="dl-time">
                        {new Date(Number(d.timestamp) * 1000).toLocaleString()}
                      </div>

                      <div className="dl-amount">
                        {ethers.formatEther(d.amount)}
                        <span className="dl-amount-unit">ETH</span>
                      </div>

                      {hasProof && (
                        <div className="dl-proof-row">
                          <a
                            className="dl-proof-link"
                            href={`https://gateway.pinata.cloud/ipfs/${proofHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            ◈ View proof of fund usage
                            <svg className="dl-proof-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </motion.li>
                  )
                })}
              </motion.ul>

              {/* Total row */}
              {donations.length > 1 && (
                <motion.div
                  className="dl-total"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: donations.length * 0.06 + 0.1, duration: 0.35 }}
                >
                  <span className="dl-total-label">Total Donated</span>
                  <span className="dl-total-value">
                    {donations
                      .reduce((sum, d) => sum + Number(ethers.formatEther(d.amount)), 0)
                      .toFixed(4)}
                    <span className="dl-total-unit">ETH</span>
                  </span>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  )
}

export default DonationList
