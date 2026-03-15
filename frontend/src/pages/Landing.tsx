import { motion, AnimatePresence } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import DonationList from '../components/DonationList';
import abi from '../blockchain/abi';

const SEPOLIA_RPC = 'https://ethereum-sepolia.publicnode.com';

const Landing = () => {
  const { account, connectWallet, contract, totalDonations, totalEthRaised, campaignCount } = useWeb3();
  const navigate = useNavigate();
  const [showDemo, setShowDemo]                   = useState(false);
  const [demoCampaign, setDemoCampaign]           = useState<any>(null);
  const [loadingDemo, setLoadingDemo]             = useState(false);
  const [donatingDemo, setDonatingDemo]           = useState(false);
  const [showDemoDonations, setShowDemoDonations] = useState(false);
  const [readOnlyContract, setReadOnlyContract]   = useState<any>(null);
  const [lastTxHash, setLastTxHash]               = useState<string | null>(null);

  const DEMO_CAMPAIGN_ID = 2;

  const particles = [...Array(24)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    dx: (Math.random() - 0.5) * 60,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 5,
  }));

  useEffect(() => {
    if (account) navigate('/dashboard');
  }, [account, navigate]);

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const contractInstance = new ethers.Contract(
      import.meta.env.VITE_CONTRACT_ADDRESS,
      abi,
      provider
    );
    setReadOnlyContract(contractInstance);
  }, []);

  useEffect(() => {
    const fetchDemoCampaign = async () => {
      if (!readOnlyContract) return;
      setLoadingDemo(true);
      try {
        const c = await readOnlyContract.getCampaign(DEMO_CAMPAIGN_ID);
        setDemoCampaign({
          id: Number(c[0]),
          name: c[1],
          description: c[2],
          owner: c[3],
          amountRaised: c[4],
          targetAmount: c[5],
          withdrawn: c[6],
          proofHash: c[7],
        });
      } catch (error) {
        console.error('Failed to fetch demo campaign', error);
      } finally {
        setLoadingDemo(false);
      }
    };
    fetchDemoCampaign();
  }, [readOnlyContract]);

  const handleDemoDonate = async () => {
    if (!account) { connectWallet(); return; }
    setDonatingDemo(true);
    try {
      const tx = await contract.donate(DEMO_CAMPAIGN_ID, { value: ethers.parseEther('0.001') });
      await tx.wait();
      setLastTxHash(tx.hash);
      alert('Demo donation successful!');
      const updated = await contract.getCampaign(DEMO_CAMPAIGN_ID);
      setDemoCampaign({
        id: Number(updated[0]),
        name: updated[1],
        description: updated[2],
        owner: updated[3],
        amountRaised: updated[4],
        targetAmount: updated[5],
        withdrawn: updated[6],
        proofHash: updated[7],
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Donation failed');
    } finally {
      setDonatingDemo(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          width: 100%;
          min-height: 100vh;
          background: #080c14;
        }

        .pg-landing {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #080c14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px 120px;
          font-family: 'Syne', sans-serif;
        }

        .pg-grid-bg {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(61,217,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,217,255,0.045) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          z-index: 0;
        }

        .pg-grid-fade {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse 80% 65% at 50% 45%, transparent 10%, #080c14 75%);
          pointer-events: none;
          z-index: 0;
        }

        .pg-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 680px;
        }

        .pg-badge {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #3dd9ff;
          border: 1px solid rgba(99,210,255,0.22);
          padding: 6px 16px;
          border-radius: 20px;
          margin-bottom: 32px;
          background: rgba(61,217,255,0.06);
        }

        .pg-title {
          font-size: clamp(56px, 13vw, 100px);
          font-weight: 800;
          line-height: 0.95;
          text-align: center;
          letter-spacing: -0.035em;
          color: #e8f4fb;
          margin-bottom: 24px;
        }
        .pg-title .accent { color: #3dd9ff; }
        .pg-title .dim    { color: #4a6a7e; }

        .pg-problem {
          font-size: clamp(13px, 2.5vw, 15px);
          color: rgba(224,100,100,0.75);
          font-weight: 600;
          text-align: center;
          margin-bottom: 6px;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.03em;
        }

        .pg-sub {
          font-size: clamp(14px, 2.5vw, 16px);
          color: #7ba4bb;
          text-align: center;
          max-width: 480px;
          line-height: 1.75;
          margin-bottom: 12px;
        }

        .pg-tagline {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: rgba(61,217,255,0.45);
          margin-bottom: 40px;
          text-align: center;
        }

        /* ── Glow button ── */
        .pg-btn-wrap {
          position: relative;
          display: inline-flex;
          margin-bottom: 8px;
        }

        @property --pg-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        .pg-btn-glow {
          position: absolute;
          inset: -4px;
          border-radius: 14px;
          background: conic-gradient(
            from var(--pg-angle),
            #3dd9ff 0%,
            #22d3a5 25%,
            #7ae8ff 50%,
            #22d3a5 75%,
            #3dd9ff 100%
          );
          animation: pg-rotate-glow 2.8s linear infinite;
          filter: blur(7px);
          opacity: 0.8;
          z-index: 0;
          transition: opacity 0.2s, filter 0.2s;
        }

        @keyframes pg-rotate-glow {
          to { --pg-angle: 360deg; }
        }

        .pg-btn-wrap:hover .pg-btn-glow {
          opacity: 1;
          filter: blur(10px);
        }

        .pg-connect-btn {
          position: relative;
          z-index: 1;
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #080c14;
          background: #3dd9ff;
          border: none;
          border-radius: 10px;
          padding: 15px 48px;
          cursor: pointer;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }

        .pg-connect-btn:hover  { background: #84ecff; }
        .pg-connect-btn:active { transform: scale(0.97); }

        /* ── Stats panel ── */
        .pg-stats-panel {
          margin-top: 32px;
          padding: 16px 24px;
          background: rgba(13,19,32,0.85);
          border: 1px solid rgba(61,217,255,0.14);
          border-radius: 14px;
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          width: 100%;
          backdrop-filter: blur(8px);
        }

        .pg-network-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(34,211,165,0.09);
          border: 1px solid rgba(34,211,165,0.28);
          padding: 5px 12px;
          border-radius: 20px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #22d3a5;
        }

        .pg-green-dot {
          width: 7px; height: 7px;
          background: #22d3a5;
          border-radius: 50%;
          box-shadow: 0 0 6px #22d3a5;
          animation: pg-blink 2s ease infinite;
          flex-shrink: 0;
        }

        @keyframes pg-blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }

        .pg-stat-sep {
          width: 1px; height: 30px;
          background: rgba(99,210,255,0.1);
          flex-shrink: 0;
        }

        .pg-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          font-family: 'Space Mono', monospace;
        }

        .pg-stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #3dd9ff;
          line-height: 1;
        }

        .pg-stat-label {
          font-size: 9px;
          text-transform: uppercase;
          color: #7ba4bb;
          letter-spacing: 0.09em;
        }

        /* ── Demo toggle ── */
        .pg-demo-toggle {
          margin-top: 20px;
          background: transparent;
          border: 1px solid rgba(61,217,255,0.2);
          color: rgba(61,217,255,0.65);
          padding: 9px 22px;
          border-radius: 20px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pg-demo-toggle:hover {
          background: rgba(61,217,255,0.07);
          border-color: rgba(61,217,255,0.45);
          color: #3dd9ff;
        }

        /* ── Demo card ── */
        .pg-demo-card {
          margin-top: 16px;
          background: rgba(13,19,32,0.88);
          border: 1px solid rgba(61,217,255,0.15);
          border-radius: 14px;
          padding: 22px 24px;
          width: 100%;
          backdrop-filter: blur(8px);
          text-align: left;
        }

        .pg-demo-card-label {
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #3dd9ff;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pg-demo-card-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(61,217,255,0.1);
        }

        .pg-demo-name {
          font-size: 17px;
          font-weight: 700;
          color: #e8f4fb;
          margin-bottom: 6px;
        }

        .pg-demo-desc {
          font-size: 13px;
          color: #7ba4bb;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .pg-demo-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }

        .pg-demo-raised {
          font-family: 'Space Mono', monospace;
          font-size: 15px;
          font-weight: 700;
          color: #22d3a5;
        }

        .pg-demo-target {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: rgba(123,164,187,0.6);
        }

        .pg-demo-track {
          height: 3px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 18px;
        }

        .pg-demo-fill {
          height: 100%;
          border-radius: 3px;
          background: linear-gradient(90deg, #3dd9ff, #22d3a5);
          transition: width 1s ease;
        }

        .pg-demo-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .pg-donate-btn {
          flex: 1;
          min-width: 130px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #080c14;
          background: #3dd9ff;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          white-space: nowrap;
        }

        .pg-donate-btn:hover:not(:disabled) { background: #84ecff; transform: translateY(-1px); }
        .pg-donate-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .pg-ledger-btn {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #7ba4bb;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(99,210,255,0.15);
          border-radius: 8px;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .pg-ledger-btn:hover {
          border-color: rgba(61,217,255,0.3);
          color: #3dd9ff;
          background: rgba(61,217,255,0.05);
        }

        .pg-tx-panel {
          margin-top: 14px;
          padding: 12px 14px;
          background: rgba(34,211,165,0.06);
          border: 1px solid rgba(34,211,165,0.2);
          border-radius: 10px;
          font-family: 'Space Mono', monospace;
        }

        .pg-tx-title {
          color: #22d3a5;
          font-size: 11px;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }

        .pg-tx-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .pg-tx-hash {
          color: rgba(123,164,187,0.65);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          font-size: 10px;
        }

        .pg-tx-link {
          color: #3dd9ff;
          text-decoration: none;
          font-size: 11px;
          flex-shrink: 0;
          transition: color 0.2s;
        }
        .pg-tx-link:hover { color: #84ecff; }

        .pg-demo-footer {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(99,210,255,0.08);
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
        }

        .pg-demo-footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pg-demo-footer-label { color: rgba(123,164,187,0.45); }

        .pg-demo-footer-link {
          color: rgba(61,217,255,0.65);
          text-decoration: none;
          transition: color 0.2s;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
          white-space: nowrap;
        }
        .pg-demo-footer-link:hover { color: #3dd9ff; }

        .pg-wallet-warn {
          margin-top: 10px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(234,179,8,0.65);
          text-align: center;
          letter-spacing: 0.04em;
        }

        .pg-demo-loading {
          text-align: center;
          padding: 28px 0;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          color: #7ba4bb;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .pg-demo-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(61,217,255,0.15);
          border-top-color: #3dd9ff;
          border-radius: 50%;
          animation: pg-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes pg-spin { to { transform: rotate(360deg); } }

        .pg-demo-error {
          text-align: center;
          padding: 24px 0;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          color: rgba(224,90,90,0.75);
        }

        /* ── Features ── */
        .pg-features {
          display: flex;
          gap: clamp(14px, 4vw, 36px);
          margin-top: 48px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pg-feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 9px;
          color: #7ba4bb;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .pg-feature-icon {
          width: 42px; height: 42px;
          border: 1px solid rgba(99,210,255,0.18);
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(61,217,255,0.04);
          font-size: 18px;
          transition: border-color 0.2s, background 0.2s;
        }

        .pg-feature:hover .pg-feature-icon {
          border-color: rgba(61,217,255,0.35);
          background: rgba(61,217,255,0.09);
        }

        /* ── Particles ── */
        .pg-particle {
          position: fixed;
          border-radius: 50%;
          background: #3dd9ff;
          pointer-events: none;
          z-index: 1;
        }

        /* ── Scroll hint ── */
        .pg-scroll-hint {
          position: fixed;
          bottom: 22px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          color: rgba(123,164,187,0.35);
          font-size: 9px;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.06em;
          pointer-events: none;
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .pg-landing { padding: 72px 16px 100px; }
          .pg-stats-panel { gap: 14px; padding: 14px 14px; }
          .pg-stat-sep { display: none; }
          .pg-demo-card { padding: 18px 16px; }
          .pg-demo-actions { flex-direction: column; }
          .pg-donate-btn { min-width: unset; }
        }
      `}</style>

      <div className="pg-landing">
        <div className="pg-grid-bg" />
        <div className="pg-grid-fade" />

        {/* Particles */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="pg-particle"
              style={{ width: p.size, height: p.size, left: `${p.x}%`, bottom: `${p.y * 0.4}%`, opacity: 0 }}
              animate={{ y: [0, -340], x: [0, p.dx], opacity: [0, 0.45, 0.25, 0] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>

        <div className="pg-content">

          <motion.div
            className="pg-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            ⬡ Ethereum · IPFS · Web3
          </motion.div>

          <motion.h1
            className="pg-title"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            Proof<span className="accent">Of</span>
            <br />
            <span className="dim">Giving</span>
          </motion.h1>

          <motion.p
            className="pg-problem"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Charity lacks transparency.
          </motion.p>

          <motion.p
            className="pg-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.7 }}
          >
            Every donation is recorded on‑chain. Fund usage verified via IPFS.
          </motion.p>

          <motion.p
            className="pg-tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            ✦ Donate with proof. Give with trust. ✦
          </motion.p>

          {/* Glow button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <motion.div
              className="pg-btn-wrap"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="pg-btn-glow" />
              <button className="pg-connect-btn" onClick={connectWallet}>
                Connect MetaMask
              </button>
            </motion.div>
          </motion.div>

          {/* Stats panel — wallet connected only */}
          <AnimatePresence>
            {account && (
              <motion.div
                className="pg-stats-panel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.4 }}
              >
                <div className="pg-network-badge">
                  <span className="pg-green-dot" />
                  Sepolia
                </div>
                <div className="pg-stat-sep" />
                <div className="pg-stat-item">
                  <span className="pg-stat-value" style={{ fontSize: 13 }}>
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <span className="pg-stat-label">Wallet</span>
                </div>
                <div className="pg-stat-sep" />
                <div className="pg-stat-item">
                  <span className="pg-stat-value">{campaignCount}</span>
                  <span className="pg-stat-label">Campaigns</span>
                </div>
                <div className="pg-stat-sep" />
                <div className="pg-stat-item">
                  <span className="pg-stat-value">{totalDonations}</span>
                  <span className="pg-stat-label">Donations</span>
                </div>
                <div className="pg-stat-sep" />
                <div className="pg-stat-item">
                  <span className="pg-stat-value">{Number(totalEthRaised).toFixed(2)}</span>
                  <span className="pg-stat-label">ETH Raised</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Demo toggle */}
          <motion.button
            className="pg-demo-toggle"
            onClick={() => setShowDemo(!showDemo)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            {showDemo ? '↑ Hide Demo' : '⚡ Try Live Demo'}
          </motion.button>

          {/* Demo card */}
          <AnimatePresence>
            {showDemo && (
              <motion.div
                className="pg-demo-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.28 }}
              >
                <div className="pg-demo-card-label">Live Campaign · Sepolia</div>

                {loadingDemo ? (
                  <div className="pg-demo-loading">
                    <div className="pg-demo-spinner" />
                    Fetching on-chain data...
                  </div>
                ) : demoCampaign ? (
                  <>
                    <div className="pg-demo-name">{demoCampaign.name}</div>
                    <div className="pg-demo-desc">{demoCampaign.description}</div>

                    <div className="pg-demo-meta-row">
                      <span className="pg-demo-raised">
                        {ethers.formatEther(demoCampaign.amountRaised)} ETH
                      </span>
                      <span className="pg-demo-target">
                        of {ethers.formatEther(demoCampaign.targetAmount)} ETH
                      </span>
                    </div>

                    <div className="pg-demo-track">
                      <div
                        className="pg-demo-fill"
                        style={{
                          width: `${Math.min(
                            (Number(ethers.formatEther(demoCampaign.amountRaised)) /
                              Number(ethers.formatEther(demoCampaign.targetAmount))) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="pg-demo-actions">
                      <button
                        className="pg-donate-btn"
                        onClick={handleDemoDonate}
                        disabled={donatingDemo}
                      >
                        {donatingDemo ? 'Sending...' : '⚡ Donate 0.001 ETH'}
                      </button>
                      <button
                        className="pg-ledger-btn"
                        onClick={() => setShowDemoDonations(!showDemoDonations)}
                      >
                        {showDemoDonations ? 'Hide' : 'View'} Ledger
                      </button>
                    </div>

                    <AnimatePresence>
                      {lastTxHash && (
                        <motion.div
                          className="pg-tx-panel"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="pg-tx-title">✓ Transaction Confirmed</div>
                          <div className="pg-tx-row">
                            <span className="pg-tx-hash">{lastTxHash}</span>
                            <a
                              className="pg-tx-link"
                              href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View ↗
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="pg-demo-footer">
                      <div className="pg-demo-footer-row">
                        <span className="pg-demo-footer-label">Contract</span>
                        <a
                          className="pg-demo-footer-link"
                          href={`https://sepolia.etherscan.io/address/${import.meta.env.VITE_CONTRACT_ADDRESS}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {String(import.meta.env.VITE_CONTRACT_ADDRESS).slice(0, 10)}...↗
                        </a>
                      </div>
                      {demoCampaign.proofHash && (
                        <div className="pg-demo-footer-row">
                          <span className="pg-demo-footer-label">IPFS Proof</span>
                          <a
                            className="pg-demo-footer-link"
                            href={`https://gateway.pinata.cloud/ipfs/${demoCampaign.proofHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {demoCampaign.proofHash.slice(0, 10)}...↗
                          </a>
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {showDemoDonations && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden', marginTop: 16, maxHeight: 260, overflowY: 'auto' }}
                        >
                          <DonationList campaignId={DEMO_CAMPAIGN_ID} proofHash={demoCampaign.proofHash} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!account && (
                      <div className="pg-wallet-warn">
                        ⚠ Connect wallet to make a real testnet donation
                      </div>
                    )}
                  </>
                ) : (
                  <div className="pg-demo-error">
                    Demo campaign not found. Ensure campaign ID {DEMO_CAMPAIGN_ID} exists on Sepolia.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feature icons */}
          <div className="pg-features">
            {[
              { icon: '⛓', label: 'On-Chain' },
              { icon: '◈',  label: 'IPFS Verified' },
              { icon: '◎',  label: 'Zero Trust' },
              { icon: '◬',  label: 'Immutable' },
            ].map(({ icon, label }, i) => (
              <motion.div
                key={label}
                className="pg-feature"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + i * 0.08, duration: 0.45 }}
              >
                <div className="pg-feature-icon">{icon}</div>
                {label}
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default Landing;
