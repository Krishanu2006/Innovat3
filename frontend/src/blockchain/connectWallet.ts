// Add type declaration for window.ethereum
interface Ethereum {
  request: (args: { method: string }) => Promise<any>;
}
declare global {
  interface Window {
    ethereum?: Ethereum;
  }
}

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Install MetaMask")
    return
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  })

  return accounts[0]
}