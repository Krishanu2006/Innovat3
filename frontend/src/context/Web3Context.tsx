import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../blockchain/contract';

interface Web3ContextType {
  account: string | null;
  connectWallet: () => Promise<void>;
  contract: any;
  fetchCampaigns: () => Promise<void>;
  campaigns: any[];
  loading: boolean;
  totalDonations: number;
  totalEthRaised: number;
  campaignCount: number;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalEthRaised, setTotalEthRaised] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Install MetaMask!');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
      const contractInstance = await getContract();
      setContract(contractInstance);
      // Optionally switch to Sepolia
      const network = await provider.getNetwork();
      if (network.chainId !== 11155111n) {
        alert('Please switch to Sepolia network');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCampaigns = async () => {
    if (!contract) return;
    setLoading(true);
    try {
      const count = await contract.campaignCount();
      setCampaignCount(Number(count));
      let totalDon = 0;
      let totalEth = 0;
      const campaignsArray = [];
      for (let i = 1; i <= count; i++) {
        const c = await contract.getCampaign(i);
        campaignsArray.push({
          id: Number(c[0]),
          name: c[1],
          description: c[2],
          owner: c[3],
          targetAmount: c[4],
          amountRaised: c[5],
          withdrawn: c[6],
          proofHash: c[7],
        });
        const donations = await contract.getDonations(i);
        totalDon += donations.length;
        totalEth += Number(ethers.formatEther(c[5]));
      }
      setCampaigns(campaignsArray);
      setTotalDonations(totalDon);
      setTotalEthRaised(totalEth);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [contract]);

  return (
    <Web3Context.Provider value={{ account, connectWallet, contract, campaigns, loading, totalDonations, totalEthRaised, campaignCount, fetchCampaigns }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within Web3Provider');
  return context;
};