import { ethers } from 'ethers';
import DonateButton from './DonateButton';
import WithdrawButton from './WithdrawButton';
import UploadProofButton from './UploadProofButton';
import DonationList from './DonationList';
import { useWeb3 } from '../context/Web3Context';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Campaign {
  id: number;
  name: string;
  description: string;
  amountRaised: bigint;          // ethers v6 uses bigint
  targetAmount: bigint;           // ethers v6 uses bigint
  owner: string;
  withdrawn: boolean;
  proofHash?: string;
}

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const { account, fetchCampaigns } = useWeb3();
  const [showDonations, setShowDonations] = useState(false);

  const raised    = Number(ethers.formatEther(campaign.amountRaised));
  const target    = Number(ethers.formatEther(campaign.targetAmount));
  const progress  = Math.min((raised / target) * 100, 100);
  const isOwner   = account?.toLowerCase() === campaign.owner.toLowerCase();
  const goalMet   = campaign.amountRaised >= campaign.targetAmount;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        .cc-card {
          font-family: 'Syne', sans-serif;
          background: rgba(13,19,32,0.92);
          border: 1px solid rgba(99,210,255,0.11);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.25s, transform 0.2s;
          display: flex;
          flex-direction: column;
        }

        .cc-card:hover {
          border-color: rgba(61,217,255,0.25);
        }

        /* Top accent bar — changes color by state */
        .cc-accent-bar {
          height: 2px;
          width: 100%;
          flex-shrink: 0;
        }
        .cc-accent-bar--active    { background: linear-gradient(90deg, #3dd9ff, #22d3a5); }
        .cc-accent-bar--goal      { background: linear-gradient(90deg, #22d3a5, #3dd9ff); }
        .cc-accent-bar--withdrawn { background: linear-gradient(90deg, #7ba4bb55, #7ba4bb22); }

        .cc-body { padding: 20px 20px 0; flex: 1; display: flex; flex-direction: column; }

        /* Header row */
        .cc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 8px;
        }

        .cc-name {
          font-size: 15px;
          font-weight: 700;
          color: #e8f4fb;
          line-height: 1.3;
          flex: 1;
        }

        .cc-badge {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-radius: 10px;
          padding: 3px 9px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .cc-badge--active    { background: rgba(61,217,255,0.1);  color: #3dd9ff;  border: 1px solid rgba(61,217,255,0.22); }
        .cc-badge--goal      { background: rgba(34,211,165,0.1);  color: #22d3a5;  border: 1px solid rgba(34,211,165,0.25); }
        .cc-badge--withdrawn { background: rgba(123,164,187,0.08); color: #7ba4bb; border: 1px solid rgba(123,164,187,0.2); }

        /* Description */
        .cc-desc {
          font-size: 13px;
          color: #7ba4bb;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 16px;
        }

        /* Progress */
        .cc-progress-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 7px;
        }

        .cc-raised {
          font-family: 'Space Mono', monospace;
          font-size: 15px;
          font-weight: 700;
          color: #22d3a5;
        }

        .cc-target {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: rgba(123,164,187,0.65);
        }

        .cc-bar-track {
          width: 100%;
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 6px;
        }

        .cc-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1s ease;
        }
        .cc-bar-fill--active    { background: linear-gradient(90deg, #3dd9ff, #22d3a5); }
        .cc-bar-fill--withdrawn { background: rgba(123,164,187,0.35); }

        .cc-pct {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(123,164,187,0.5);
          text-align: right;
          display: block;
          margin-bottom: 14px;
        }

        /* Owner row */
        .cc-owner {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(123,164,187,0.45);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .cc-owner-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(61,217,255,0.3);
          flex-shrink: 0;
        }

        /* Divider */
        .cc-divider {
          height: 1px;
          background: rgba(99,210,255,0.07);
          margin: 0 -20px;
        }

        /* Actions */
        .cc-actions {
          padding: 14px 0 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cc-withdrawn-msg {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #22d3a5;
          padding: 8px 0;
        }

        .cc-withdrawn-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(34,211,165,0.12);
          border: 1px solid rgba(34,211,165,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          flex-shrink: 0;
        }

        /* Proof link */
        .cc-proof-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(61,217,255,0.7);
          text-decoration: none;
          padding: 7px 0;
          border-top: 1px solid rgba(99,210,255,0.07);
          transition: color 0.2s;
        }

        .cc-proof-link:hover { color: #3dd9ff; }

        /* Toggle donations */
        .cc-toggle-row {
          padding: 12px 20px;
          border-top: 1px solid rgba(99,210,255,0.07);
        }

        .cc-toggle-btn {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(123,164,187,0.6);
          transition: color 0.2s;
        }

        .cc-toggle-btn:hover { color: #3dd9ff; }

        .cc-toggle-chevron {
          width: 14px;
          height: 14px;
          transition: transform 0.25s ease;
        }

        .cc-toggle-chevron--open { transform: rotate(180deg); }

        /* Donations panel */
        .cc-donations-panel {
          padding: 0 20px 16px;
          overflow: hidden;
        }
      `}</style>

      <motion.div
        className="cc-card"
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        {/* Top accent bar */}
        <div className={`cc-accent-bar ${
          campaign.withdrawn ? 'cc-accent-bar--withdrawn'
          : goalMet          ? 'cc-accent-bar--goal'
          :                    'cc-accent-bar--active'
        }`} />

        <div className="cc-body">

          {/* Name + status badge */}
          <div className="cc-header">
            <div className="cc-name">{campaign.name}</div>
            <span className={`cc-badge ${
              campaign.withdrawn ? 'cc-badge--withdrawn'
              : goalMet          ? 'cc-badge--goal'
              :                    'cc-badge--active'
            }`}>
              {campaign.withdrawn ? 'Withdrawn' : goalMet ? 'Goal Met' : 'Active'}
            </span>
          </div>

          {/* Description */}
          <p className="cc-desc">{campaign.description}</p>

          {/* Progress */}
          <div className="cc-progress-row">
            <span className="cc-raised">{raised.toFixed(4)} ETH</span>
            <span className="cc-target">of {target} ETH</span>
          </div>
          <div className="cc-bar-track">
            <div
              className={`cc-bar-fill ${campaign.withdrawn ? 'cc-bar-fill--withdrawn' : 'cc-bar-fill--active'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="cc-pct">{progress.toFixed(1)}%</span>

          {/* Owner */}
          <div className="cc-owner">
            <span className="cc-owner-dot" />
            {campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}
            {isOwner && <span style={{ color: 'rgba(61,217,255,0.5)', marginLeft: 4 }}>· you</span>}
          </div>

          <div className="cc-divider" />

          {/* Actions – only render if wallet connected */}
          {account && (
            <div className="cc-actions">
              {campaign.withdrawn ? (
                <div className="cc-withdrawn-msg">
                  <span className="cc-withdrawn-icon">✓</span>
                  Funds withdrawn
                </div>
              ) : goalMet ? (
                <WithdrawButton
                  campaignId={campaign.id}
                  owner={campaign.owner}
                  currentAccount={account}   // ✅ account is string now
                  onWithdrawSuccess={fetchCampaigns}
                />
              ) : (
                <DonateButton
                  campaignId={campaign.id}
                  onDonateSuccess={fetchCampaigns}
                />
              )}

              <UploadProofButton
                campaignId={campaign.id}
                owner={campaign.owner}
                currentAccount={account}     // ✅ account is string
                onUploadSuccess={fetchCampaigns}
              />

              {campaign.proofHash && (
                <a
                  className="cc-proof-link"
                  href={`https://gateway.pinata.cloud/ipfs/${campaign.proofHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>◈</span>
                  View IPFS Proof ↗
                </a>
              )}
            </div>
          )}

        </div>{/* end cc-body */}

        {/* Toggle donations */}
        <div className="cc-toggle-row">
          <button
            className="cc-toggle-btn"
            onClick={() => setShowDonations(!showDonations)}
          >
            <span>Donations</span>
            <svg
              className={`cc-toggle-chevron ${showDonations ? 'cc-toggle-chevron--open' : ''}`}
              viewBox="0 0 14 14" fill="none"
            >
              <path d="M2 4.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showDonations && (
            <motion.div
              key="donations"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              <div className="cc-donations-panel">
                <DonationList campaignId={campaign.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </>
  );
};

export default CampaignCard;