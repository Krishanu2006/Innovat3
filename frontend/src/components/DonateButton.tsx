import { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../blockchain/contract';

interface DonateButtonProps {
  campaignId: number;
  onDonateSuccess: () => void;
}

const DonateButton = ({ campaignId, onDonateSuccess }: DonateButtonProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (!amount) return alert('Enter amount');
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.donate(campaignId, { value: ethers.parseEther(amount) });
      await tx.wait();
      alert('Donation successful!');
      setAmount('');
      onDonateSuccess();
    } catch (error) {
      console.error(error);
      alert('Donation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700&display=swap');

        .db-wrap {
          display: flex;
          gap: 8px;
          align-items: stretch;
        }

        .db-input-wrap {
          position: relative;
          flex: 1;
        }

        .db-input {
          width: 100%;
          box-sizing: border-box;
          padding: 8px 36px 8px 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.13);
          border-radius: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          color: #e8f4fb;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }

        .db-input::placeholder {
          color: rgba(123,164,187,0.4);
          letter-spacing: 0.04em;
        }

        .db-input:focus {
          border-color: rgba(61,217,255,0.45);
          background: rgba(61,217,255,0.04);
        }

        /* ETH label inside input */
        .db-input-unit {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.08em;
          color: rgba(61,217,255,0.45);
          pointer-events: none;
          text-transform: uppercase;
        }

        .db-btn {
          position: relative;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0d1320;
          background: linear-gradient(135deg, #3dd9ff, #22d3a5);
          transition: opacity 0.2s, transform 0.15s;
          white-space: nowrap;
          overflow: hidden;
        }

        .db-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
          border-radius: inherit;
        }

        .db-btn:hover:not(:disabled)::after {
          background: rgba(255,255,255,0.12);
        }

        .db-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .db-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        /* Loading spinner dots */
        .db-dots {
          display: inline-flex;
          gap: 3px;
          align-items: center;
        }

        .db-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #0d1320;
          animation: db-pulse 1.2s ease-in-out infinite;
        }

        .db-dot:nth-child(2) { animation-delay: 0.2s; }
        .db-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes db-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40%            { opacity: 1;   transform: scale(1);   }
        }
      `}</style>

      <div className="db-wrap">
        <div className="db-input-wrap">
          <input
            className="db-input"
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDonate()}
          />
          <span className="db-input-unit">ETH</span>
        </div>

        <button
          className="db-btn"
          onClick={handleDonate}
          disabled={loading}
        >
          {loading ? (
            <span className="db-dots">
              <span className="db-dot" />
              <span className="db-dot" />
              <span className="db-dot" />
            </span>
          ) : (
            'Donate'
          )}
        </button>
      </div>
    </>
  );
};

export default DonateButton;