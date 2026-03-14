import { motion } from 'framer-motion';
import { useWeb3 } from '../context/Web3Context';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import DonationList from '../components/DonationList';
import abi from '../blockchain/abi'; // your contract ABI

const SEPOLIA_RPC = 'https://ethereum-sepolia.publicnode.com';  // public RPC endpoint

const Landing = () => {
    const { account, connectWallet, contract, totalDonations, totalEthRaised, campaignCount } = useWeb3();
    const navigate = useNavigate();
    const [showDemo, setShowDemo] = useState(false);
    const [demoCampaign, setDemoCampaign] = useState<any>(null);
    const [loadingDemo, setLoadingDemo] = useState(false);
    const [donatingDemo, setDonatingDemo] = useState(false);
    const [showDemoDonations, setShowDemoDonations] = useState(false);
    const [readOnlyContract, setReadOnlyContract] = useState<any>(null);

    const DEMO_CAMPAIGN_ID = 1; // change if your first campaign has a different ID

    // Generate random particles (unchanged)
    const particles = [...Array(24)].map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        dx: (Math.random() - 0.5) * 60,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 12 + 10,
        delay: Math.random() * 5,
    }));

    // Redirect if already connected
    useEffect(() => {
        if (account) navigate('/dashboard');
    }, [account, navigate]);

    // Create a read‑only contract instance (no wallet needed)
    useEffect(() => {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        const contractInstance = new ethers.Contract(
            import.meta.env.VITE_CONTRACT_ADDRESS,
            abi,
            provider
        );
        setReadOnlyContract(contractInstance);
    }, []);

    // Fetch demo campaign using the read‑only contract
    useEffect(() => {
        const fetchDemoCampaign = async () => {
            if (!readOnlyContract) return;
            setLoadingDemo(true);
            try {
                console.log('ReadOnlyContract:', readOnlyContract);
                const c = await readOnlyContract.getCampaign(DEMO_CAMPAIGN_ID);
                console.log('Campaign data:', c);
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

    // Handle demo donation – uses the connected wallet's contract
    const handleDemoDonate = async () => {
        if (!account) {
            connectWallet(); // prompt connection first
            return;
        }
        setDonatingDemo(true);
        try {
            const tx = await contract.donate(DEMO_CAMPAIGN_ID, {
                value: ethers.parseEther('0.001'), // fixed demo amount
            });
            await tx.wait();
            alert('Demo donation successful! You can view it on the ledger below.');
            // Refresh campaign data to update raised amount
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
            alert(error.message || 'Donation failed. Make sure you are on Sepolia and have test ETH.');
        } finally {
            setDonatingDemo(false);
        }
    };

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

        .pg-stats-panel {
          margin-top: 2rem;
          padding: 1rem 1.5rem;
          background: rgba(13,19,32,0.8);
          border: 1px solid rgba(61,217,255,0.15);
          border-radius: 12px;
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          backdrop-filter: blur(4px);
          z-index: 2;
          position: relative;
        }

        .pg-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Space Mono', monospace;
        }

        .pg-stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #3dd9ff;
        }

        .pg-stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: #7ba4bb;
          letter-spacing: 0.05em;
        }

        .pg-network-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34,211,165,0.1);
          border: 1px solid rgba(34,211,165,0.3);
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          color: #22d3a5;
          margin-top: 0.5rem;
        }

        .pg-green-dot {
          width: 8px;
          height: 8px;
          background: #22d3a5;
          border-radius: 50%;
          box-shadow: 0 0 8px #22d3a5;
        }

        .pg-demo-card {
          margin-top: 2rem;
          background: rgba(13,19,32,0.8);
          border: 1px solid rgba(61,217,255,0.15);
          border-radius: 12px;
          padding: 1.5rem;
          width: 100%;
          max-width: 400px;
          backdrop-filter: blur(4px);
          z-index: 2;
          position: relative;
          text-align: left;
        }

        .pg-demo-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #e8f4fb;
        }

        .pg-demo-desc {
          font-size: 0.8rem;
          color: #7ba4bb;
          margin: 0.5rem 0;
        }

        .pg-demo-progress {
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          margin: 1rem 0;
          overflow: hidden;
        }

        .pg-demo-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3dd9ff, #22d3a5);
        }

        .pg-try-demo-btn {
          background: transparent;
          border: 1px solid rgba(61,217,255,0.3);
          color: #3dd9ff;
          padding: 0.5rem 1.2rem;
          border-radius: 20px;
          font-family: 'Space Mono', monospace;
          font-size: 0.75rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
        }

        .pg-try-demo-btn:hover {
          background: rgba(61,217,255,0.1);
          border-color: #3dd9ff;
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
                    <span className="block text-lg font-semibold text-red-400/80">Charity lacks transparency.</span>
                    <span className="block text-base text-indigo-100 mt-1">
                        We fix it: every donation is recorded on‑chain, and fund usage is verified via IPFS.
                    </span>
                </motion.p>

                {/* Tagline badge */}
                <motion.div
                    className="mt-3 inline-block px-4 py-1 bg-indigo-800/30 border border-indigo-500/30 rounded-full text-sm font-mono"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    ✦ Donate with proof. Give with trust. ✦
                </motion.div>

                {/* Connect Button */}
                <motion.div
                    style={{ marginTop: '2rem' }}
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

                {/* Wallet Status & Stats Panel (shown only when connected) */}
                {account && (
                    <motion.div
                        className="pg-stats-panel"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                    >
                        <div className="pg-network-badge">
                            <span className="pg-green-dot" />
                            Sepolia
                        </div>
                        <div className="pg-stat-item">
                            <span className="pg-stat-label">Wallet</span>
                            <span className="pg-stat-value text-sm">
                                {account.slice(0, 6)}...{account.slice(-4)}
                            </span>
                        </div>
                        <div className="pg-stat-item">
                            <span className="pg-stat-label">Campaigns</span>
                            <span className="pg-stat-value">{campaignCount}</span>
                        </div>
                        <div className="pg-stat-item">
                            <span className="pg-stat-label">Donations</span>
                            <span className="pg-stat-value">{totalDonations}</span>
                        </div>
                        <div className="pg-stat-item">
                            <span className="pg-stat-label">ETH Raised</span>
                            <span className="pg-stat-value">{totalEthRaised.toFixed(2)}</span>
                        </div>
                    </motion.div>
                )}

                {/* Try Demo Button */}
                <motion.button
                    className="pg-try-demo-btn"
                    onClick={() => setShowDemo(!showDemo)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3 }}
                >
                    {showDemo ? 'Hide Demo' : 'Try Live Demo'}
                </motion.button>

                {/* Interactive Demo Campaign Card */}
                {showDemo && (
                    <motion.div
                        className="pg-demo-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loadingDemo ? (
                            <div className="text-center py-4">Loading demo campaign...</div>
                        ) : demoCampaign ? (
                            <>
                                <div className="pg-demo-title">{demoCampaign.name}</div>
                                <div className="pg-demo-desc">{demoCampaign.description}</div>

                                <div className="pg-demo-progress">
                                    <div
                                        className="pg-demo-progress-fill"
                                        style={{
                                            width: `${(Number(ethers.formatEther(demoCampaign.amountRaised)) /
                                                Number(ethers.formatEther(demoCampaign.targetAmount))) * 100}%`,
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between text-xs text-gray-400 mb-3">
                                    <span>Raised: {ethers.formatEther(demoCampaign.amountRaised)} ETH</span>
                                    <span>Target: {ethers.formatEther(demoCampaign.targetAmount)} ETH</span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDemoDonate}
                                        disabled={donatingDemo}
                                        className="flex-1 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 py-2 rounded-md text-sm font-mono hover:bg-indigo-600/30 disabled:opacity-50"
                                    >
                                        {donatingDemo ? 'Donating...' : '⚡ Donate 0.001 ETH (Live)'}
                                    </button>
                                    <button
                                        onClick={() => setShowDemoDonations(!showDemoDonations)}
                                        className="px-3 py-2 bg-gray-700/30 border border-gray-600 rounded-md text-xs"
                                    >
                                        {showDemoDonations ? 'Hide' : 'View'} Ledger
                                    </button>
                                </div>

                                {showDemoDonations && (
                                    <div className="mt-4 max-h-60 overflow-y-auto">
                                        <DonationList campaignId={DEMO_CAMPAIGN_ID} />
                                    </div>
                                )}

                                {!account && (
                                    <div className="mt-2 text-xs text-yellow-500/80 text-center">
                                        Connect wallet to make a real testnet donation.
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-4 text-red-400">
                                Demo campaign not found. Make sure you have created campaign ID {DEMO_CAMPAIGN_ID} on Sepolia.
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Features */}
                <div className="pg-features">
                    {[
                        { icon: '⛓', label: 'On-Chain' },
                        { icon: '◈', label: 'IPFS Verified' },
                        { icon: '◎', label: 'Zero Trust' },
                        { icon: '◬', label: 'Immutable' },
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
            </div>
        </>
    );
};

export default Landing;