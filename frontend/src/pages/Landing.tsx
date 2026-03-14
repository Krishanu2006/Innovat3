import { motion } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Landing = () => {
  const { account, connectWallet } = useWeb3();
  const navigate = useNavigate();

  useEffect(() => {
    if (account) navigate('/dashboard');
  }, [account, navigate]);

  const particles = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1.5,
    duration: Math.random() * 15 + 8,
    delay: Math.random() * -20,
    dx: (Math.random() - 0.5) * 120,
  }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        .pg-landing {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: #080c14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
          font-family: 'Syne', sans-serif;
        }

        .pg-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(61,217,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,217,255,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .pg-grid-fade {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 70% 60% at 50% 50%, transparent 20%, #080c14 80%);
          pointer-events: none;
        }

        .pg-badge {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          color: #3dd9ff;
          border: 1px solid rgba(99,210,255,0.22);
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 28px;
          background: rgba(61,217,255,0.06);
          position: relative;
          z-index: 2;
        }

        .pg-title {
          font-size: clamp(52px, 10vw, 88px);
          font-weight: 800;
          line-height: 1.0;
          text-align: center;
          letter-spacing: -0.03em;
          color: #e8f4fb;
          position: relative;
          z-index: 2;
          margin-bottom: 20px;
        }

        .pg-title .accent { color: #3dd9ff; }
        .pg-title .dim    { color: #7ba4bb; }

        .pg-sub {
          font-size: 16px;
          color: #7ba4bb;
          text-align: center;
          max-width: 500px;
          line-height: 1.7;
          position: relative;
          z-index: 2;
          margin-bottom: 40px;
          font-weight: 400;
        }

        .pg-connect-btn {
          position: relative;
          z-index: 2;
          font-family: 'Space Mono', monospace;
          font-size: 14px;
          font-weight: 700;
          color: #080c14;
          background: #3dd9ff;
          border: none;
          border-radius: 8px;
          padding: 14px 36px;
          cursor: pointer;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: background 0.2s, transform 0.15s;
          animation: pg-pulse 3s ease infinite;
        }

        .pg-connect-btn:hover {
          background: #7ae8ff;
        }

        @keyframes pg-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(61,217,255,0.4); }
          50%      { box-shadow: 0 0 0 14px rgba(61,217,255,0); }
        }

        .pg-features {
          display: flex;
          gap: 32px;
          margin-top: 56px;
          position: relative;
          z-index: 2;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pg-feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          color: #7ba4bb;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pg-feature-icon {
          width: 40px;
          height: 40px;
          border: 1px solid rgba(99,210,255,0.22);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(61,217,255,0.05);
          font-size: 18px;
        }

        .pg-scroll-hint {
          position: absolute;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #7ba4bb;
          font-size: 10px;
          font-family: 'Space Mono', monospace;
        }

        .pg-particle {
          position: absolute;
          border-radius: 50%;
          background: #3dd9ff;
          pointer-events: none;
        }
      `}</style>

      <div className="pg-landing">
        <div className="pg-grid-bg" />
        <div className="pg-grid-fade" />

        {/* Animated background particles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="pg-particle"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                bottom: `${p.y * 0.4}%`,
                opacity: 0,
              }}
              animate={{
                y: [0, -320],
                x: [0, p.dx],
                opacity: [0, 0.5, 0.3, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </div>

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
          className="pg-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9 }}
        >
          Transparent donations on the blockchain. Every contribution is permanently
          recorded, and fund usage is verified via IPFS.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.button
            className="pg-connect-btn"
            onClick={connectWallet}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Connect MetaMask
          </motion.button>
        </motion.div>

        <div className="pg-features">
          {[
            { icon: '⛓', label: 'On-Chain' },
            { icon: '◈',  label: 'IPFS Verified' },
            { icon: '◎',  label: 'Zero Trust' },
            { icon: '◬',  label: 'Immutable' },
          ].map(({ icon, label }) => (
            <motion.div
              key={label}
              className="pg-feature"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.5 }}
            >
              <div className="pg-feature-icon">{icon}</div>
              {label}
            </motion.div>
          ))}
        </div>

        {/* Scroll hint chevron — same as original bounce */}
        <motion.div
          className="pg-scroll-hint"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
            <path d="M1 1l9 9 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M1 6l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
          </svg>
        </motion.div>
      </div>
    </>
  );
};

export default Landing;
