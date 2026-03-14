// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract TransparentCharity {
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    struct Campaign {
        uint256 id;
        string name;
        string description;
        address payable owner;
        uint256 targetAmount;
        uint256 amountRaised;
        bool withdrawn;
        string proofHash; // IPFS hash of proof document
        Donation[] donations;
    }

    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;

    event CampaignCreated(uint256 indexed id, string name, uint256 targetAmount, address owner);
    event DonationReceived(uint256 indexed campaignId, address indexed donor, uint256 amount);
    event FundsWithdrawn(uint256 indexed campaignId, uint256 amount, address owner);
    event ProofUploaded(uint256 indexed campaignId, string proofHash);

    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign does not exist");
        _;
    }

    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _targetAmount
    ) external {
        require(_targetAmount > 0, "Target must be >0");

        campaignCount++;
        Campaign storage newCampaign = campaigns[campaignCount];
        newCampaign.id = campaignCount;
        newCampaign.name = _name;
        newCampaign.description = _description;
        newCampaign.owner = payable(msg.sender);
        newCampaign.targetAmount = _targetAmount;
        newCampaign.amountRaised = 0;
        newCampaign.withdrawn = false;
        newCampaign.proofHash = "";

        emit CampaignCreated(campaignCount, _name, _targetAmount, msg.sender);
    }

    function donate(uint256 _campaignId) external payable campaignExists(_campaignId) {
        require(msg.value > 0, "Donation must be >0");

        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.amountRaised + msg.value <= campaign.targetAmount, "Exceeds target");
        require(!campaign.withdrawn, "Funds already withdrawn");

        campaign.donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        campaign.amountRaised += msg.value;

        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }

    function withdrawFunds(uint256 _campaignId) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.owner, "Only owner");
        require(!campaign.withdrawn, "Already withdrawn");
        require(campaign.amountRaised > 0, "No funds to withdraw");

        campaign.withdrawn = true;
        uint256 amount = campaign.amountRaised;
        campaign.owner.transfer(amount);

        emit FundsWithdrawn(_campaignId, amount, msg.sender);
    }

    function uploadProof(uint256 _campaignId, string memory _proofHash) external campaignExists(_campaignId) {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.owner, "Only owner");
        require(bytes(_proofHash).length > 0, "Hash cannot be empty");

        campaign.proofHash = _proofHash;

        emit ProofUploaded(_campaignId, _proofHash);
    }

    function getCampaign(uint256 _campaignId) external view campaignExists(_campaignId) returns (
        uint256 id,
        string memory name,
        string memory description,
        address owner,
        uint256 targetAmount,
        uint256 amountRaised,
        bool withdrawn,
        string memory proofHash
    ) {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.id,
            campaign.name,
            campaign.description,
            campaign.owner,
            campaign.targetAmount,
            campaign.amountRaised,
            campaign.withdrawn,
            campaign.proofHash
        );
    }

    function getDonations(uint256 _campaignId) external view campaignExists(_campaignId) returns (Donation[] memory) {
        return campaigns[_campaignId].donations;
    }
}