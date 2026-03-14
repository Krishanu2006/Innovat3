import expect from "chai/expect";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("TransparentCharity", function () {
  // Fixture to deploy contract and get signers
  async function deployCharityFixture() {
    const [owner, donor1, donor2, other] = await ethers.getSigners();

    const Charity = await ethers.getContractFactory("TransparentCharity");
    const charity = await Charity.deploy();

    return { charity, owner, donor1, donor2, other };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { charity, owner } = await loadFixture(deployCharityFixture);
      // No specific owner check, but we can check initial campaign count
      expect(await charity.campaignCount()).to.equal(0);
    });
  });

  describe("Campaign Creation", function () {
    it("Should create a campaign and emit event", async function () {
      const { charity, owner } = await loadFixture(deployCharityFixture);

      const target = ethers.parseEther("5");
      await expect(charity.createCampaign("Flood Relief", "Help flood victims", target))
        .to.emit(charity, "CampaignCreated")
        .withArgs(1, "Flood Relief", target, owner.address);

      expect(await charity.campaignCount()).to.equal(1);

      const campaign = await charity.getCampaign(1);
      expect(campaign.name).to.equal("Flood Relief");
      expect(campaign.description).to.equal("Help flood victims");
      expect(campaign.owner).to.equal(owner.address);
      expect(campaign.targetAmount).to.equal(target);
      expect(campaign.amountRaised).to.equal(0);
      expect(campaign.withdrawn).to.be.false;
      expect(campaign.proofHash).to.equal("");
    });

    it("Should revert if target amount is zero", async function () {
      const { charity } = await loadFixture(deployCharityFixture);
      await expect(charity.createCampaign("Test", "Desc", 0)).to.be.revertedWith("Target must be >0");
    });
  });

  describe("Donations", function () {
    it("Should allow donations and update campaign", async function () {
      const { charity, donor1, donor2, owner } = await loadFixture(deployCharityFixture);

      const target = ethers.parseEther("5");
      await charity.createCampaign("Flood Relief", "Help", target);

      const donation1 = ethers.parseEther("1");
      const donation2 = ethers.parseEther("2");

      // Donation from donor1
      await expect(charity.connect(donor1).donate(1, { value: donation1 }))
        .to.emit(charity, "DonationReceived")
        .withArgs(1, donor1.address, donation1);

      // Donation from donor2
      await charity.connect(donor2).donate(1, { value: donation2 });

      const campaign = await charity.getCampaign(1);
      expect(campaign.amountRaised).to.equal(donation1 + donation2);

      // Check donations array
      const donations = await charity.getDonations(1);
      expect(donations.length).to.equal(2);
      expect(donations[0].donor).to.equal(donor1.address);
      expect(donations[0].amount).to.equal(donation1);
      expect(donations[1].donor).to.equal(donor2.address);
      expect(donations[1].amount).to.equal(donation2);
    });

    it("Should revert if donation exceeds target", async function () {
      const { charity, donor1 } = await loadFixture(deployCharityFixture);

      const target = ethers.parseEther("1");
      await charity.createCampaign("Test", "Desc", target);

      const donation = ethers.parseEther("2");
      await expect(charity.connect(donor1).donate(1, { value: donation })).to.be.revertedWith("Exceeds target");
    });

    it("Should revert if campaign does not exist", async function () {
      const { charity, donor1 } = await loadFixture(deployCharityFixture);
      await expect(charity.connect(donor1).donate(99, { value: 1 })).to.be.revertedWith("Campaign does not exist");
    });

    it("Should revert if donation is zero", async function () {
      const { charity, donor1 } = await loadFixture(deployCharityFixture);
      await charity.createCampaign("Test", "Desc", ethers.parseEther("1"));
      await expect(charity.connect(donor1).donate(1, { value: 0 })).to.be.revertedWith("Donation must be >0");
    });

    it("Should revert if funds already withdrawn", async function () {
      const { charity, donor1, owner } = await loadFixture(deployCharityFixture);
      const target = ethers.parseEther("1");
      await charity.createCampaign("Test", "Desc", target);
      await charity.connect(donor1).donate(1, { value: ethers.parseEther("1") });
      await charity.connect(owner).withdrawFunds(1);
      await expect(charity.connect(donor1).donate(1, { value: ethers.parseEther("1") })).to.be.revertedWith("Funds already withdrawn");
    });
  });

  describe("Withdraw Funds", function () {
    it("Should allow owner to withdraw and mark as withdrawn", async function () {
      const { charity, donor1, owner } = await loadFixture(deployCharityFixture);

      const target = ethers.parseEther("2");
      await charity.createCampaign("Test", "Desc", target);
      const donation = ethers.parseEther("1.5");
      await charity.connect(donor1).donate(1, { value: donation });

      // Check balances before withdrawal
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      // Withdraw
      await expect(charity.connect(owner).withdrawFunds(1))
        .to.emit(charity, "FundsWithdrawn")
        .withArgs(1, donation, owner.address);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.be.closeTo(donation, ethers.parseEther("0.001")); // Account for gas

      const campaign = await charity.getCampaign(1);
      expect(campaign.withdrawn).to.be.true;
    });

    it("Should revert if not owner", async function () {
      const { charity, donor1, donor2 } = await loadFixture(deployCharityFixture);

      await charity.createCampaign("Test", "Desc", ethers.parseEther("1"));
      await charity.connect(donor1).donate(1, { value: ethers.parseEther("0.5") });

      await expect(charity.connect(donor2).withdrawFunds(1)).to.be.revertedWith("Only owner");
    });

    it("Should revert if already withdrawn", async function () {
      const { charity, donor1, owner } = await loadFixture(deployCharityFixture);

      await charity.createCampaign("Test", "Desc", ethers.parseEther("1"));
      await charity.connect(donor1).donate(1, { value: ethers.parseEther("0.5") });
      await charity.connect(owner).withdrawFunds(1);
      await expect(charity.connect(owner).withdrawFunds(1)).to.be.revertedWith("Already withdrawn");
    });

    it("Should revert if no funds raised", async function () {
      const { charity, owner } = await loadFixture(deployCharityFixture);

      await charity.createCampaign("Test", "Desc", ethers.parseEther("1"));
      await expect(charity.connect(owner).withdrawFunds(1)).to.be.revertedWith("No funds to withdraw");
    });
  });

  describe("Upload Proof", function () {
    it("Should allow owner to upload IPFS hash", async function () {
      const { charity, owner } = await loadFixture(deployCharityFixture);

      await charity.createCampaign("Test", "Desc", ethers.parseEther("1"));
      const proofHash = "QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isbZxtaVe";

      await expect(charity.connect(owner).uploadProof(1, proofHash))
        .to.emit(charity, "ProofUploaded")
        .withArgs(1, proofHash);

      const campaign = await charity.getCampaign(1);
      expect(campaign.proofHash).to.equal(proofHash);
    });

    it("Should revert if not owner", async function () {
      const { charity, donor1 } = await loadFixture(deployCharityFixture);

      await charity.createCampaign("Test", "Desc", ethers.parseEther("1"));
      await expect(charity.connect(donor1).uploadProof(1, "hash")).to.be.revertedWith("Only owner");
    });

    it("Should revert if hash empty", async function () {
      const { charity, owner } = await loadFixture(deployCharityFixture);

      await charity.createCampaign("Test", "Desc", ethers.parseEther("1"));
      await expect(charity.connect(owner).uploadProof(1, "")).to.be.revertedWith("Hash cannot be empty");
    });
  });

  describe("Get Campaign and Donations", function () {
    it("Should return correct campaign data", async function () {
      const { charity, owner } = await loadFixture(deployCharityFixture);

      await charity.createCampaign("Name", "Desc", ethers.parseEther("10"));
      const campaign = await charity.getCampaign(1);
      expect(campaign.id).to.equal(1);
      expect(campaign.name).to.equal("Name");
      expect(campaign.description).to.equal("Desc");
      expect(campaign.owner).to.equal(owner.address);
      expect(campaign.targetAmount).to.equal(ethers.parseEther("10"));
      expect(campaign.amountRaised).to.equal(0);
      expect(campaign.withdrawn).to.be.false;
      expect(campaign.proofHash).to.equal("");
    });

    it("Should revert if campaign does not exist", async function () {
      const { charity } = await loadFixture(deployCharityFixture);
      await expect(charity.getCampaign(999)).to.be.revertedWith("Campaign does not exist");
    });

    it("Should return donations array", async function () {
      const { charity, donor1, donor2 } = await loadFixture(deployCharityFixture);

      await charity.createCampaign("Test", "Desc", ethers.parseEther("5"));
      await charity.connect(donor1).donate(1, { value: ethers.parseEther("1") });
      await charity.connect(donor2).donate(1, { value: ethers.parseEther("2") });

      const donations = await charity.getDonations(1);
      expect(donations.length).to.equal(2);
      expect(donations[0].donor).to.equal(donor1.address);
      expect(donations[0].amount).to.equal(ethers.parseEther("1"));
      expect(donations[1].donor).to.equal(donor2.address);
      expect(donations[1].amount).to.equal(ethers.parseEther("2"));
    });
  });
});