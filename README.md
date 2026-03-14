**Web3 Donation Tracker**
A decentralized, transparent donation platform built on Ethereum (Sepolia testnet) that records every donation on the blockchain and stores proof of fund usage on IPFS. No more wondering where your money went – everything is publicly verifiable.

**The Problem**
Charity donations often lack transparency. Donors give money but have no way to verify:
How much was actually raised?
Was the money used for the intended purpose?
Who donated what and when?
Traditional systems rely on trust in a central authority. This project replaces trust with code and cryptography.

**Our Solution**
A fully decentralized donation tracker where:
Anyone can create a campaign (set a name, description, and fundraising target).
Anyone can donate ETH to any campaign.
Every donation is permanently recorded on the Sepolia blockchain.
Campaign owners can withdraw funds once the target is reached.
Owners can upload proof of fund usage (images, PDFs) to IPFS – the hash is stored on-chain.
A public transparency ledger shows all donations with donor addresses, amounts, and timestamps.
A live dashboard displays total campaigns, total donations, and total ETH raised.
No backend, no database – just smart contracts and the decentralized web.

**Features**
1.MetaMask wallet connection
2.Create fundraising campaigns
3.Donate ETH (any amount > 0)
4.Real‑time donation ledger for each campaign
5.Withdraw funds (only by campaign owner, after target reached)
6.Upload proof to IPFS via Pinata – images, PDFs, etc.
7.View proof files directly from the app (via IPFS gateway)
8.Dashboard with total stats
9.Progress bar for each campaign
10.Fully typed with TypeScript

**Tech Stack**
 --------------------------------------------------
| **Layer** |           **Technology**             |
 --------------------------------------------------
| Blockchain|  Solidity, Hardhat, Sepolia Testnet  |
 --------------------------------------------------
|  Frontend |       React, Typescript, Vite        |
 --------------------------------------------------
|   Web3    |          ether.js, Metamask          |
 --------------------------------------------------
|  Storage  |           IPFS (via Pinata)          |
 --------------------------------------------------
|   Tools   |           npm, Git, VS Code          |
 --------------------------------------------------