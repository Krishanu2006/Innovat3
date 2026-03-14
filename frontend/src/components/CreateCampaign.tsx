import { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../blockchain/contract';

interface CreateCampaignProps {
  onCampaignCreated: () => void;
}

const CreateCampaign = ({ onCampaignCreated }: CreateCampaignProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.createCampaign(
        name,
        description,
        ethers.parseEther(target)
      );
      await tx.wait();
      alert('Campaign created!');
      setName('');
      setDescription('');
      setTarget('');
      onCampaignCreated();
    } catch (error) {
      console.error(error);
      alert('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        .cc-form {
          font-family: 'Syne', sans-serif;
        }

        .cc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }

        @media (max-width: 540px) {
          .cc-grid { grid-template-columns: 1fr; }
        }

        .cc-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .cc-field-full {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 14px;
        }

        .cc-label {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #7ba4bb;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cc-label-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #3dd9ff;
          flex-shrink: 0;
        }

        .cc-input,
        .cc-textarea {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.14);
          border-radius: 8px;
          padding: 11px 14px;
          color: #e8f4fb;
          font-size: 14px;
          font-family: 'Syne', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          width: 100%;
          box-sizing: border-box;
        }

        .cc-input::placeholder,
        .cc-textarea::placeholder {
          color: rgba(123,164,187,0.45);
        }

        .cc-input:focus,
        .cc-textarea:focus {
          border-color: rgba(61,217,255,0.5);
          background: rgba(61,217,255,0.04);
        }

        .cc-textarea {
          resize: none;
          line-height: 1.6;
        }

        .cc-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 4px;
        }

        .cc-hint {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(123,164,187,0.55);
          letter-spacing: 0.04em;
        }

        .cc-submit {
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #080c14;
          background: #3dd9ff;
          border: none;
          border-radius: 8px;
          padding: 12px 28px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, opacity 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .cc-submit:hover:not(:disabled) {
          background: #7ae8ff;
          transform: translateY(-1px);
        }

        .cc-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .cc-submit:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .cc-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(8,12,20,0.3);
          border-top-color: #080c14;
          border-radius: 50%;
          animation: cc-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes cc-spin {
          to { transform: rotate(360deg); }
        }

        .cc-divider {
          width: 100%;
          height: 1px;
          background: rgba(99,210,255,0.08);
          margin: 18px 0;
        }
      `}</style>

      <form className="cc-form" onSubmit={handleSubmit}>

        {/* Row 1: Name + Target side by side */}
        <div className="cc-grid">
          <div className="cc-field">
            <label className="cc-label">
              <span className="cc-label-dot" />
              Campaign Name
            </label>
            <input
              className="cc-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Clean water for Nakuru..."
              required
            />
          </div>

          <div className="cc-field">
            <label className="cc-label">
              <span className="cc-label-dot" />
              Target (ETH)
            </label>
            <input
              className="cc-input"
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="5.0"
              required
            />
          </div>
        </div>

        {/* Row 2: Description full width */}
        <div className="cc-field-full">
          <label className="cc-label">
            <span className="cc-label-dot" />
            Description
          </label>
          <textarea
            className="cc-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you're raising funds for and how they will be used..."
            rows={3}
            required
          />
        </div>

        <div className="cc-divider" />

        <div className="cc-footer">
          <span className="cc-hint">Transaction will be signed via MetaMask</span>

          <button className="cc-submit" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="cc-spinner" />
                Deploying...
              </>
            ) : (
              <>
                Deploy Campaign →
              </>
            )}
          </button>
        </div>

      </form>
    </>
  );
};

export default CreateCampaign;