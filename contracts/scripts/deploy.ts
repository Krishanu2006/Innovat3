import { ethers } from "hardhat";

async function main() {
  const TransparentCharity = await ethers.getContractFactory("TransparentCharity");
  const contract = await TransparentCharity.deploy();

  // In ethers v6, we wait for the deployment transaction to be mined
  await contract.waitForDeployment();

  // Get the deployed contract address
  const contractAddress = await contract.getAddress();

  console.log("TransparentCharity deployed to:", contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});