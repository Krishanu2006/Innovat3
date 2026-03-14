import { useWeb3 } from '../context/Web3Context';
import Navbar from '../components/Navbar';
import CreateCampaign from '../components/CreateCampaign';
import CampaignCard from '../components/CampaignCard';
import { motion } from 'framer-motion';

/* ─────────────────────────────────────────────
   Stat card — same props as original
───────────────────────────────────────────── */
const StatCard = ({ title, value }: { title: string; value: string | number }) => (
    <div className="db-stat-card">
        <div className="db-stat-label">{title}</div>
        <div className="db-stat-value">{value}</div>
    </div>
);

/* ─────────────────────────────────────────────
   Dashboard page
───────────────────────────────────────────── */
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

    if (!account) return null; // Should be redirected

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');

        /* ── Root tokens ── */
        .db-root {
          min-height: 100vh;
          background: #080c14;
          font-family: 'Syne', sans-serif;
          color: #e8f4fb;
        }

        /* ── Main container ── */
        .db-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px 64px;
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
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #e8f4fb;
          line-height: 1;
        }

        .db-subtitle {
          margin-top: 6px;
          font-size: 13px;
          color: #7ba4bb;
          font-family: 'Space Mono', monospace;
        }

        .db-wallet-chip {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: #22d3a5;
          border: 1px solid rgba(34,211,165,0.3);
          background: rgba(34,211,165,0.07);
          padding: 8px 14px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
        }

        .db-wallet-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22d3a5;
          flex-shrink: 0;
          animation: db-blink 2s ease infinite;
        }

        @keyframes db-blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }

        /* ── Stats grid ── */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        @media (max-width: 560px) {
          .db-stats-grid { grid-template-columns: 1fr; }
        }

        .db-stat-card {
          background: rgba(13,19,32,0.9);
          border: 1px solid rgba(99,210,255,0.11);
          border-radius: 12px;
          padding: 20px 22px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .db-stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, #3dd9ff, #22d3a5);
        }

        .db-stat-card:hover {
          border-color: rgba(99,210,255,0.22);
        }

        .db-stat-label {
          font-size: 11px;
          color: #7ba4bb;
          font-family: 'Space Mono', monospace;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .db-stat-value {
          font-size: 30px;
          font-weight: 800;
          color: #e8f4fb;
          margin-top: 10px;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        /* ── Section card wrapper ── */
        .db-section-card {
            background: linear-gradient(
            180deg,
            rgba(13,19,32,0.95),
            rgba(13,19,32,0.85)
        );
            border: 1px solid rgba(61,217,255,0.14);
            border-radius: 14px;
            padding: 26px 28px;
            margin-bottom: 28px;
        position: relative;
  overflow: hidden;
}

.db-section-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at top right,
    rgba(61,217,255,0.06),
    transparent 60%
  );
  pointer-events: none;
}

        /* ── Section heading ── */
        .db-section-heading {
          font-size: 16px;
          font-weight: 700;
          color: #e8f4fb;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .db-section-heading::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 16px;
          background: #3dd9ff;
          border-radius: 2px;
          flex-shrink: 0;
        }

        /* ── Campaign grid ── */
        .db-campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        /* ── Loading spinner ── */
        .db-spinner-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 64px 0;
        }

        .db-spinner {
          width: 36px;
          height: 36px;
          border: 2px solid rgba(61,217,255,0.15);
          border-top-color: #3dd9ff;
          border-radius: 50%;
          animation: db-spin 0.8s linear infinite;
        }

        @keyframes db-spin {
          to { transform: rotate(360deg); }
        }

        /* ── Empty state ── */
        .db-empty {
          text-align: center;
          padding: 64px 20px;
          color: #7ba4bb;
          font-family: 'Space Mono', monospace;
          font-size: 13px;
          line-height: 1.8;
        }

        .db-empty-icon {
          font-size: 32px;
          margin-bottom: 14px;
          opacity: 0.5;
        }
      `}</style>

            <div className="db-root">
                <Navbar />

                <main className="db-main">

                    <motion.div
                        style={{
                            marginBottom: "26px",
                            fontFamily: "Space Mono, monospace",
                            fontSize: "12px",
                            color: "#7ba4bb",
                            letterSpacing: "0.08em"
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
  // {campaignCount} campaigns active
                    </motion.div>

                    {/* ── Stats ── */}
                    <motion.div
                        className="db-stats-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                    >
                        <StatCard title="Total Campaigns" value={campaignCount} />
                        <StatCard title="Total Donations" value={totalDonations} />
                        <StatCard title="Total ETH Raised" value={`${totalEthRaised.toFixed(4)} ETH`} />
                    </motion.div>

                    {/* ── Create Campaign ── */}
                    <motion.div
                        className="db-section-card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                    >
                        <div className="db-section-heading">Create New Campaign</div>
                        <CreateCampaign onCampaignCreated={fetchCampaigns} />
                    </motion.div>

                    {/* ── All Campaigns ── */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                    >
                        <div className="db-section-heading" style={{ marginBottom: 18 }}>
                            All Campaigns
                        </div>

                        {loading ? (
                            <div className="db-spinner-wrap">
                                <div className="db-spinner" />
                            </div>
                        ) : campaigns.length === 0 ? (
                            <div className="db-empty">
                                <div className="db-empty-icon">◎</div>
                                No campaigns yet.
                                <br />
                                Create one to get started.
                            </div>
                        ) : (
                            <div className="db-campaigns-grid">
                                {campaigns.map((campaign) => (
                                    <CampaignCard key={campaign.id} campaign={campaign} />
                                ))}
                            </div>
                        )}
                    </motion.div>

                </main>
            </div>
        </>
    );
};

export default Dashboard;
