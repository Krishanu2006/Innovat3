import { ethers } from 'ethers'
import abi from './abi'

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS

export const getContract = async () => {
  if (!window.ethereum) throw new Error('MetaMask not found')
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return new ethers.Contract(contractAddress, abi, signer)
}