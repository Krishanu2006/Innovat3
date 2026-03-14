import { useWeb3 } from '../context/Web3Context'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const Navbar = () => {
  const { account } = useWeb3()
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS2
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        .nav-root {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          background: rgba(8,12,20,0.82);
          border-bottom: 1px solid rgba(99,210,255,0.1);
        }

        .nav-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* Logo */
        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 19px;
          letter-spacing: -0.02em;
          color: #e8f4fb;
          display: flex;
          align-items: center;
          gap: 2px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .nav-logo-accent {
          background: linear-gradient(90deg, #3dd9ff, #22d3a5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Desktop nav */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link {
          font-size: 12px;
          font-family: 'Space Mono', monospace;
          color: #7ba4bb;
          text-decoration: none;
          padding: 7px 12px;
          border-radius: 8px;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: color 0.2s, background 0.2s;
          position: relative;
        }

        .nav-link:hover {
          color: #e8f4fb;
          background: rgba(255,255,255,0.04);
        }

        .nav-link.active {
          color: #3dd9ff;
          background: rgba(61,217,255,0.07);
        }

        .nav-ext-icon {
          width: 10px;
          height: 10px;
          opacity: 0.55;
          flex-shrink: 0;
          transition: opacity 0.2s;
        }

        .nav-link:hover .nav-ext-icon { opacity: 1; }

        /* Active indicator dot under link */
        .nav-active-dot {
          position: absolute;
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #3dd9ff;
        }

        /* Wallet chip */
        .nav-wallet {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #22d3a5;
          border: 1px solid rgba(34,211,165,0.28);
          background: rgba(34,211,165,0.07);
          padding: 7px 14px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 7px;
          margin-left: 4px;
          white-space: nowrap;
        }

        .nav-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22d3a5;
          flex-shrink: 0;
          animation: nav-blink 2s ease infinite;
        }

        @keyframes nav-blink {
          0%,100% { opacity: 1; box-shadow: 0 0 4px #22d3a5; }
          50%      { opacity: 0.3; box-shadow: none; }
        }

        /* Mobile hamburger */
        .nav-hamburger {
          display: none;
          background: none;
          border: 1px solid rgba(99,210,255,0.15);
          border-radius: 8px;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #7ba4bb;
          flex-direction: column;
          gap: 5px;
          padding: 0;
          transition: border-color 0.2s, color 0.2s;
        }

        .nav-hamburger:hover {
          border-color: rgba(61,217,255,0.3);
          color: #3dd9ff;
        }

        .nav-bar {
          width: 16px;
          height: 1.5px;
          background: currentColor;
          border-radius: 2px;
          transition: transform 0.25s, opacity 0.25s;
          transform-origin: center;
        }

        .nav-bar.open-1 { transform: translateY(6.5px) rotate(45deg); }
        .nav-bar.open-2 { opacity: 0; }
        .nav-bar.open-3 { transform: translateY(-6.5px) rotate(-45deg); }

        /* Mobile menu panel */
        .nav-mobile-panel {
          position: absolute;
          top: 64px;
          left: 0;
          right: 0;
          background: rgba(8,12,20,0.97);
          border-bottom: 1px solid rgba(99,210,255,0.1);
          padding: 12px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .nav-mobile-link {
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          color: #7ba4bb;
          text-decoration: none;
          padding: 12px 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          letter-spacing: 0.04em;
          transition: color 0.2s, background 0.2s;
          border: 1px solid transparent;
        }

        .nav-mobile-link:hover,
        .nav-mobile-link.active {
          color: #3dd9ff;
          background: rgba(61,217,255,0.06);
          border-color: rgba(61,217,255,0.12);
        }

        .nav-mobile-wallet {
          margin-top: 8px;
          padding: 12px 14px;
          background: rgba(34,211,165,0.06);
          border: 1px solid rgba(34,211,165,0.2);
          border-radius: 10px;
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          color: #22d3a5;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 640px) {
          .nav-links    { display: none; }
          .nav-hamburger { display: flex; }
          .nav-container { padding: 0 16px; }
        }
      `}</style>

      <motion.nav
        className="nav-root"
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'sticky' }}
      >
        <div className="nav-container">

          {/* Logo */}
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link to="/" className="nav-logo">
              Proof<span className="nav-logo-accent">OfGiving</span>
            </Link>
          </motion.div>

          {/* Desktop links */}
          <div className="nav-links">
            <Link
              to="/dashboard"
              className={`nav-link${location.pathname === '/dashboard' ? ' active' : ''}`}
            >
              Dashboard
              {location.pathname === '/dashboard' && (
                <motion.span
                  className="nav-active-dot"
                  layoutId="nav-active-dot"
                />
              )}
            </Link>

            {contractAddress && (
              <a
                href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                Contract
                <svg className="nav-ext-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}

            <AnimatePresence>
              {account && (
                <motion.div
                  className="nav-wallet"
                  initial={{ opacity: 0, scale: 0.85, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="nav-dot" />
                  {account.slice(0, 6)}...{account.slice(-4)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`nav-bar ${menuOpen ? 'open-1' : ''}`} />
            <div className={`nav-bar ${menuOpen ? 'open-2' : ''}`} />
            <div className={`nav-bar ${menuOpen ? 'open-3' : ''}`} />
          </button>

        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="nav-mobile-panel"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Link
                to="/dashboard"
                className={`nav-mobile-link${location.pathname === '/dashboard' ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>

              {contractAddress && (
                <a
                  href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Contract ↗
                </a>
              )}

              {account && (
                <div className="nav-mobile-wallet">
                  <span className="nav-dot" />
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.nav>
    </>
  )
}

export default Navbar
