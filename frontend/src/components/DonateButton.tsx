import { useState } from 'react';
import { ethers } from 'ethers';
import { getContract } from '../blockchain/contract';

interface DonateButtonProps {
  campaignId: number;
  onDonateSuccess: () => void;
}

const DonateButton = ({ campaignId, onDonateSuccess }: DonateButtonProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    if (!amount) return alert('Enter amount');
    setLoading(true);
    try {
      const contract = await getContract();
      const tx = await contract.donate(campaignId, { value: ethers.parseEther(amount) });
      await tx.wait();
      alert('Donation successful!');
      setAmount('');
      onDonateSuccess();
    } catch (error) {
      console.error(error);
      alert('Donation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <input
        type="text"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="flex-1 px-3 py-2 rounded-md bg-[rgba(61,217,255,0.04)] border border-[rgba(61,217,255,0.18)] text-[#414242] placeholder-[#7ba4bb] focus:outline-none focus:border-[rgba(61,217,255,0.45)]"
      />
      <button
        onClick={handleDonate}
        disabled={loading}
        className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? '...' : 'Donate'}
      </button>
    </div>
  );
};

export default DonateButton;