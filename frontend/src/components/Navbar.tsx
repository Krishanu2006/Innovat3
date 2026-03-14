import { useWeb3 } from '../context/Web3Context'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const { account } = useWeb3()
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS2

  return (
    <>
      <style>{`
        .nav-root {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(12px);
          background: rgba(8,12,20,0.85);
          border-bottom: 1px solid rgba(99,210,255,0.12);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: -0.02em;
          color: #e8f4fb;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-logo-accent {
          background: linear-gradient(90deg,#3dd9ff,#22d3a5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-link {
          font-size: 13px;
          font-family: 'Space Mono', monospace;
          color: #7ba4bb;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .nav-link:hover {
          color: #3dd9ff;
        }

        .nav-wallet {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #22d3a5;
          border: 1px solid rgba(34,211,165,0.3);
          background: rgba(34,211,165,0.08);
          padding: 7px 14px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22d3a5;
          animation: nav-blink 2s ease infinite;
        }

        @keyframes nav-blink {
          0%,100% { opacity:1 }
          50% { opacity:0.3 }
        }

        .nav-external-link-icon {
          width: 12px;
          height: 12px;
          margin-left: 4px;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .nav-link:hover .nav-external-link-icon {
          opacity: 1;
        }
      `}</style>

      <nav className="nav-root">
        <div className="nav-container">

          {/* Logo */}
          <Link to="/" className="nav-logo">
            Proof<span className="nav-logo-accent">OfGiving</span>
          </Link>

          {/* Right side */}
          <div className="nav-links">

            {/* Dashboard link */}
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>

            {/* Contract link (Etherscan) */}
            {contractAddress && (
              <a
                href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                Contract
                <svg
                  className="nav-external-link-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}

            {/* Wallet display */}
            {account && (
              <div className="nav-wallet">
                <span className="nav-dot" />
                {account.slice(0,6)}...{account.slice(-4)}
              </div>
            )}

          </div>

        </div>
      </nav>
    </>
  )
}

export default Navbar