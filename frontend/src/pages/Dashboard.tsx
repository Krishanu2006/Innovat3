import { useWeb3 } from '../context/Web3Context';
import Navbar from '../components/Navbar';
import CreateCampaign from '../components/CreateCampaign';
import CampaignCard from '../components/CampaignCard';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 } as const, // 👈 add as const
  },
} as const; // optional: also mark the whole object as const

/* ─── StatCard ─── */
const StatCard = ({
  title,
  value,
  index,
}: {
  title: string;
  value: string | number;
  index: number;
}) => (
  <motion.div
    className="db-stat-card"
    variants={fadeUp}
    whileHover={{ y: -3, borderColor: 'rgba(61,217,255,0.28)' }}
    transition={{ duration: 0.2 }}
  >
    {/* Animated scan line on hover */}
    <div className="db-stat-scanline" />
    <div className="db-stat-label">{title}</div>
    <motion.div
      className="db-stat-value"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.1, duration: 0.45 }}
    >
      {value}
    </motion.div>
  </motion.div>
);

/* ─── Dashboard ─── */
const Dashboard = () => {
  const {
    account,
    campaigns,
    loading,
    totalDonations,
    totalEthRaised,
    campaignCount,
    fetchCampaigns,
  } = useWeb3();

  if (!account) return null;

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

        /* ── Root ── */
        .db-root {
          min-height: 100vh;
          width: 100%;
          background: #080c14;
          font-family: 'Syne', sans-serif;
          color: #e8f4fb;
        }

        /* Subtle background grid — same as landing */
        .db-bg-grid {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(61,217,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61,217,255,0.03) 1px, transparent 1px);
          background-size: 44px 44px;
          pointer-events: none;
          z-index: 0;
        }

        .db-bg-fade {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse 100% 50% at 50% 0%, rgba(61,217,255,0.04) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }

        /* ── Main container ── */
        .db-main {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 36px 24px 80px;
        }

        /* ── Breadcrumb line ── */
        .db-crumb {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: rgba(123,164,187,0.5);
          letter-spacing: 0.1em;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .db-crumb-sep { color: rgba(61,217,255,0.3); }

        .db-crumb-active {
          color: #3dd9ff;
          font-weight: 700;
        }

        /* ── Page header ── */
        .db-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 14px;
        }

        .db-title {
          font-size: clamp(26px, 4vw, 38px);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #e8f4fb;
          line-height: 1;
        }

        .db-subtitle {
          margin-top: 7px;
          font-size: 12px;
          color: rgba(123,164,187,0.6);
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.06em;
        }

        /* Wallet chip */
        .db-wallet-chip {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #22d3a5;
          border: 1px solid rgba(34,211,165,0.28);
          background: rgba(34,211,165,0.07);
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          white-space: nowrap;
        }

        .db-wallet-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22d3a5;
          flex-shrink: 0;
          animation: db-blink 2s ease infinite;
        }

        @keyframes db-blink {
          0%,100% { opacity: 1; box-shadow: 0 0 5px #22d3a5; }
          50%      { opacity: 0.25; box-shadow: none; }
        }

        /* ── Stats grid ── */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        @media (max-width: 640px) {
          .db-stats-grid { grid-template-columns: 1fr; }
        }

        @media (min-width: 641px) and (max-width: 900px) {
          .db-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .db-stat-card {
          background: rgba(13,19,32,0.92);
          border: 1px solid rgba(99,210,255,0.1);
          border-radius: 14px;
          padding: 22px 24px;
          position: relative;
          overflow: hidden;
          cursor: default;
        }

        /* Top gradient bar */
        .db-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #3dd9ff, #22d3a5);
        }

        /* Glow corner */
        .db-stat-card::after {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(61,217,255,0.08), transparent 70%);
          pointer-events: none;
        }

        /* Animated scan line */
        .db-stat-scanline {
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(61,217,255,0.04), transparent);
          animation: db-scan 4s ease infinite;
        }

        @keyframes db-scan {
          0%   { left: -60%; }
          100% { left: 160%; }
        }

        .db-stat-label {
          font-size: 10px;
          color: rgba(123,164,187,0.65);
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }

        .db-stat-value {
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 800;
          color: #e8f4fb;
          margin-top: 10px;
          letter-spacing: -0.025em;
          line-height: 1;
          position: relative;
          z-index: 1;
        }

        /* ── Section card ── */
        .db-section-card {
          background: linear-gradient(160deg, rgba(13,19,32,0.96), rgba(8,12,20,0.92));
          border: 1px solid rgba(61,217,255,0.12);
          border-radius: 16px;
          padding: 26px 28px;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
        }

        .db-section-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 40% at 90% 10%, rgba(61,217,255,0.05), transparent 60%);
          pointer-events: none;
        }

        /* ── Section heading ── */
        .db-section-heading {
          font-size: 15px;
          font-weight: 700;
          color: #e8f4fb;
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .db-section-heading::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 15px;
          background: linear-gradient(180deg, #3dd9ff, #22d3a5);
          border-radius: 2px;
          flex-shrink: 0;
        }

        .db-section-heading-count {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: #3dd9ff;
          background: rgba(61,217,255,0.08);
          border: 1px solid rgba(61,217,255,0.18);
          border-radius: 10px;
          padding: 2px 9px;
          margin-left: 4px;
        }

        /* ── Campaigns grid ── */
        .db-campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 18px;
        }

        @media (max-width: 480px) {
          .db-campaigns-grid { grid-template-columns: 1fr; }
        }

        /* ── Loading ── */
        .db-spinner-wrap {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 80px 0;
          gap: 18px;
        }

        .db-spinner-ring {
          position: relative;
          width: 44px;
          height: 44px;
        }

        .db-spinner-outer {
          width: 44px; height: 44px;
          border: 2px solid rgba(61,217,255,0.12);
          border-top-color: #3dd9ff;
          border-radius: 50%;
          animation: db-spin 0.9s linear infinite;
          position: absolute;
          inset: 0;
        }

        .db-spinner-inner {
          width: 28px; height: 28px;
          border: 1.5px solid rgba(34,211,165,0.15);
          border-bottom-color: #22d3a5;
          border-radius: 50%;
          animation: db-spin-rev 0.7s linear infinite;
          position: absolute;
          top: 8px; left: 8px;
        }

        @keyframes db-spin     { to { transform: rotate(360deg); } }
        @keyframes db-spin-rev { to { transform: rotate(-360deg); } }

        .db-loading-text {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: rgba(123,164,187,0.5);
          letter-spacing: 0.1em;
          animation: db-pulse-text 1.5s ease infinite;
        }

        @keyframes db-pulse-text {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 1; }
        }

        /* ── Empty state ── */
        .db-empty {
          text-align: center;
          padding: 72px 20px;
          color: rgba(123,164,187,0.45);
          font-family: 'Space Mono', monospace;
          font-size: 12px;
          line-height: 2;
          border: 1px dashed rgba(61,217,255,0.08);
          border-radius: 14px;
        }

        .db-empty-icon {
          font-size: 28px;
          margin-bottom: 16px;
          opacity: 0.35;
          display: block;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .db-main         { padding: 24px 16px 64px; }
          .db-section-card { padding: 20px 16px; }
          .db-header       { flex-direction: column; gap: 12px; }
        }
      `}</style>

      <div className="db-root">
        <div className="db-bg-grid" />
        <div className="db-bg-fade" />

        <Navbar />

        <main className="db-main">

          {/* Breadcrumb */}
          <motion.div
            className="db-crumb"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span>// ProofOfGiving</span>
            <span className="db-crumb-sep">›</span>
            <span className="db-crumb-active">dashboard</span>
          </motion.div>

          
          {/* Stats */}
          <motion.div
            className="db-stats-grid"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <StatCard index={0} title="Total Campaigns"  value={campaignCount} />
            <StatCard index={1} title="Total Donations"  value={totalDonations} />
            <StatCard index={2} title="Total ETH Raised" value={`${totalEthRaised.toFixed(4)} ETH`} />
          </motion.div>

          {/* Create Campaign */}
          <motion.div
            className="db-section-card"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="db-section-heading">Create New Campaign</div>
            <CreateCampaign onCampaignCreated={fetchCampaigns} />
          </motion.div>

          {/* All Campaigns */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="db-section-heading" style={{ marginBottom: 18 }}>
              All Campaigns
              <span className="db-section-heading-count">{campaigns.length}</span>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  className="db-spinner-wrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="db-spinner-ring">
                    <div className="db-spinner-outer" />
                    <div className="db-spinner-inner" />
                  </div>
                  <div className="db-loading-text">Fetching on-chain data...</div>
                </motion.div>

              ) : campaigns.length === 0 ? (
                <motion.div
                  key="empty"
                  className="db-empty"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <span className="db-empty-icon">◎</span>
                  No campaigns yet.
                  <br />
                  Create one to get started.
                </motion.div>

              ) : (
                <motion.div
                  key="grid"
                  className="db-campaigns-grid"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                >
                  {campaigns.map((campaign) => (
                    <motion.div key={campaign.id} variants={cardVariant}>
                      <CampaignCard campaign={campaign} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </main>
      </div>
    </>
  );
};

export default Dashboard;
