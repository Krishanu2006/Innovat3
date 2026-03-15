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
        style={{
          flex: 1,
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid #86efac', // green-300
          backgroundColor: '#f3f4f6',   // gray-100
          color: '#166534',             // green-800
          outline: 'none',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = '#22c55e'} // green-500
        onBlur={(e) => e.currentTarget.style.borderColor = '#86efac'}
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