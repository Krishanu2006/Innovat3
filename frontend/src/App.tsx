import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { getContract } from './blockchain/contract'
import CreateCampaign from './components/CreateCampaign'
import DonateButton from './components/DonateButton'
import DonationList from './components/DonationList'
import UploadProofButton from './components/UploadProofButton'
import WithdrawButton from './components/WithdrawButton'

// Define the Campaign type
interface Campaign {
  id: number
  name: string
  description: string
  owner: string
  targetAmount: bigint
  amountRaised: bigint
  withdrawn: boolean
  proofHash: string
}

function App() {
  const [account, setAccount] = useState<string>('')
  const [campaignCount, setCampaignCount] = useState<number | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [totalDonations, setTotalDonations] = useState(0)
  const [totalEthRaised, setTotalEthRaised] = useState(0)

  // Connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      setAccount(accounts[0])
    } catch (error) {
      console.error(error)
    }
  }

  // Fetch campaign count and all campaigns
  const fetchCampaigns = async () => {
    if (!account) return
    setLoading(true)
    try {
      const contract = await getContract()
      const count = await contract.campaignCount()
      setCampaignCount(Number(count))

      // Fetch all campaigns
      const campaignArray: Campaign[] = []
      let totalDonationsCount = 0
      let totalEth = 0

      for (let i = 1; i <= Number(count); i++) {
        const c = await contract.getCampaign(i)
        campaignArray.push({
          id: Number(c[0]),
          name: c[1],
          description: c[2],
          owner: c[3],
          targetAmount: c[4],
          amountRaised: c[5],
          withdrawn: c[6],
          proofHash: c[7]
        })

        // Get donations for this campaign to count them
        const donations = await contract.getDonations(i)
        totalDonationsCount += donations.length
        totalEth += Number(ethers.formatEther(c[5])) // c[5] is amountRaised
      }
      setCampaigns(campaignArray)
      setTotalDonations(totalDonationsCount)
      setTotalEthRaised(totalEth)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refresh after campaign creation
  const refreshCampaigns = () => {
    fetchCampaigns()
  }

  // Initial fetch when account connects
  useEffect(() => {
    if (account) {
      fetchCampaigns()
    }
  }, [account])

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Web3 Donation Tracker</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <div>
          <p>Connected: {account}</p>
          {loading ? (
            <p>Loading campaigns...</p>
          ) : (
            <>
              {/* Dashboard */}
              <div style={{
                display: 'flex',
                gap: '2rem',
                margin: '2rem 0',
                padding: '1rem',
                background: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <div>
                  <h3>Total Campaigns</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{campaignCount || 0}</p>
                </div>
                <div>
                  <h3>Total Donations</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalDonations}</p>
                </div>
                <div>
                  <h3>Total ETH Raised</h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalEthRaised.toFixed(4)} ETH</p>
                </div>
              </div>

              {/* Campaign Creation Form */}
              <CreateCampaign onCampaignCreated={refreshCampaigns} />

              {/* Campaign List */}
              <h2>All Campaigns</h2>
              {campaigns.length === 0 ? (
                <p>No campaigns yet. Create one above!</p>
              ) : (
                campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    style={{
                      border: '1px solid #ccc',
                      padding: '1rem',
                      margin: '1rem 0',
                      borderRadius: '8px'
                    }}
                  >
                    <h3>{campaign.name}</h3>
                    <p>{campaign.description}</p>

                    {/* Progress Bar */}
                    <div style={{ margin: '0.5rem 0', background: '#eee', borderRadius: '4px', height: '20px' }}>
                      <div style={{
                        width: `${(Number(ethers.formatEther(campaign.amountRaised)) / Number(ethers.formatEther(campaign.targetAmount))) * 100}%`,
                        background: '#4caf50',
                        height: '100%',
                        borderRadius: '4px',
                        transition: 'width 0.3s'
                      }} />
                    </div>

                    <p>
                      <strong>Target:</strong> {ethers.formatEther(campaign.targetAmount)} ETH
                    </p>
                    <p>
                      <strong>Raised:</strong> {ethers.formatEther(campaign.amountRaised)} ETH
                    </p>
                    <p>
                      <strong>Owner:</strong> {campaign.owner.slice(0, 6)}...
                      {campaign.owner.slice(-4)}
                    </p>

                    {/* Donate / Withdraw Section */}
                    {campaign.withdrawn ? (
                      <p style={{ color: 'green' }}>✅ Funds withdrawn</p>
                    ) : (
                      <div>
                        {campaign.amountRaised < campaign.targetAmount ? (
                          <DonateButton campaignId={campaign.id} onDonateSuccess={refreshCampaigns} />
                        ) : (
                          <WithdrawButton
                            campaignId={campaign.id}
                            owner={campaign.owner}
                            currentAccount={account}
                            onWithdrawSuccess={refreshCampaigns}
                          />
                        )}
                      </div>
                    )}

                    {/* Proof Upload (only for owner) */}
                    <UploadProofButton
                      campaignId={campaign.id}
                      owner={campaign.owner}
                      currentAccount={account}
                      onUploadSuccess={refreshCampaigns}
                    />

                    {/* Display Proof Hash if exists */}
                    {campaign.proofHash && (
                      <p>
                        <strong>Proof:</strong> {campaign.proofHash.slice(0, 10)}...
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${campaign.proofHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: '0.5rem' }}
                        >
                          View
                        </a>
                      </p>
                    )}

                    <DonationList campaignId={campaign.id} />
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App