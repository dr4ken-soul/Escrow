// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract BatchEscrow {
    enum ProofStatus { None, Pending, Approved, Rejected, Claimed, Removed }

    struct Campaign {
        address agency;
        address token;
        string title;
        string brief;
        uint256 payout;
        uint256 maxSlots;
        uint256 deadline;
        uint256 reviewTimeout;
        uint256 funded;
        uint256 paid;
        uint256 withdrawn;
        uint256 joined;
        uint256 createdAt;
        bool inviteOnly;
        bytes32 inviteCodeHash;
    }

    struct Slot {
        address kol;
        string proofUrl;
        string note;
        string rejectionReason;
        uint256 payout;
        uint256 submittedAt;
        ProofStatus status;
        bool paid;
    }

    Campaign[] private campaigns;
    mapping(uint256 => Slot[]) private slots;
    mapping(uint256 => mapping(address => uint256)) private slotFor;

    event CampaignCreated(uint256 indexed campaignId, address indexed agency, string title, uint256 payout, uint256 maxSlots, uint256 deadline, bool inviteOnly);
    event CampaignFunded(uint256 indexed campaignId, uint256 amount);
    event SlotAccepted(uint256 indexed campaignId, uint256 indexed slotId, address indexed kol, uint256 payout);
    event SlotPayoutUpdated(uint256 indexed campaignId, uint256 indexed slotId, uint256 payout);
    event SlotRemoved(uint256 indexed campaignId, uint256 indexed slotId, address indexed kol);
    event ProofSubmitted(uint256 indexed campaignId, uint256 indexed slotId, string proofUrl);
    event ProofApproved(uint256 indexed campaignId, uint256 indexed slotId, address indexed kol, uint256 amount);
    event ProofRejected(uint256 indexed campaignId, uint256 indexed slotId, string reason);
    event PayoutClaimed(uint256 indexed campaignId, uint256 indexed slotId, address indexed kol, uint256 amount);
    event UnusedBudgetWithdrawn(uint256 indexed campaignId, uint256 amount);

    function createCampaign(
        address token,
        string calldata title,
        string calldata brief,
        uint256 payout,
        uint256 maxSlots,
        uint256 deadline,
        uint256 reviewTimeout,
        bool inviteOnly,
        bytes32 inviteCodeHash
    ) external returns (uint256 campaignId) {
        require(token != address(0), 'token required');
        require(bytes(title).length > 0, 'title required');
        require(payout > 0 && maxSlots > 0, 'invalid payout or slots');
        require(deadline > block.timestamp, 'deadline in past');
        require(reviewTimeout >= 1 hours && reviewTimeout <= 30 days, 'invalid review timeout');
        require(inviteOnly ? inviteCodeHash != bytes32(0) : inviteCodeHash == bytes32(0), 'invalid invite code');
        campaignId = campaigns.length;
        campaigns.push(Campaign({
            agency: msg.sender,
            token: token,
            title: title,
            brief: brief,
            payout: payout,
            maxSlots: maxSlots,
            deadline: deadline,
            reviewTimeout: reviewTimeout,
            funded: 0,
            paid: 0,
            withdrawn: 0,
            joined: 0,
            createdAt: block.timestamp,
            inviteOnly: inviteOnly,
            inviteCodeHash: inviteCodeHash
        }));
        emit CampaignCreated(campaignId, msg.sender, title, payout, maxSlots, deadline, inviteOnly);
    }

    function fundCampaign(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.agency, 'agency only');
        require(campaign.funded == 0, 'already funded');
        uint256 amount = campaign.payout * campaign.maxSlots;
        require(IERC20Minimal(campaign.token).transferFrom(msg.sender, address(this), amount), 'fund transfer failed');
        campaign.funded = amount;
        emit CampaignFunded(campaignId, amount);
    }

    function fundAdditional(uint256 campaignId, uint256 amount) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.agency, 'agency only');
        require(campaign.funded > 0, 'campaign not funded');
        require(block.timestamp < campaign.deadline, 'campaign closed');
        require(amount > 0, 'amount required');
        require(IERC20Minimal(campaign.token).transferFrom(msg.sender, address(this), amount), 'fund transfer failed');
        campaign.funded += amount;
        emit CampaignFunded(campaignId, amount);
    }

    function acceptSlot(uint256 campaignId) external returns (uint256 slotId) {
        Campaign storage campaign = campaigns[campaignId];
        require(!campaign.inviteOnly, 'invite code required');
        slotId = _acceptSlot(campaignId, campaign);
    }

    function acceptSlotWithCode(uint256 campaignId, string calldata inviteCode) external returns (uint256 slotId) {
        Campaign storage campaign = campaigns[campaignId];
        require(campaign.inviteOnly, 'campaign is open');
        require(keccak256(bytes(inviteCode)) == campaign.inviteCodeHash, 'invalid invite code');
        slotId = _acceptSlot(campaignId, campaign);
    }

    function _acceptSlot(uint256 campaignId, Campaign storage campaign) internal returns (uint256 slotId) {
        require(msg.sender != campaign.agency, 'agency cannot be KOL');
        require(campaign.funded > 0, 'campaign not funded');
        require(block.timestamp < campaign.deadline, 'campaign closed');
        require(campaign.joined < campaign.maxSlots, 'no slots left');
        require(slotFor[campaignId][msg.sender] == 0, 'already joined');
        slotId = slots[campaignId].length;
        slots[campaignId].push(Slot({kol: msg.sender, proofUrl: '', note: '', rejectionReason: '', payout: campaign.payout, submittedAt: 0, status: ProofStatus.None, paid: false}));
        slotFor[campaignId][msg.sender] = slotId + 1;
        campaign.joined += 1;
        emit SlotAccepted(campaignId, slotId, msg.sender, campaign.payout);
    }

    function setSlotPayout(uint256 campaignId, uint256 slotId, uint256 payout) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.agency, 'agency only');
        Slot storage slot = slots[campaignId][slotId];
        require(slot.status == ProofStatus.None || slot.status == ProofStatus.Rejected, 'payout is locked');
        require(payout > 0, 'invalid slot payout');

        uint256 reservedByOtherSlots;
        Slot[] storage campaignSlots = slots[campaignId];
        for (uint256 i = 0; i < campaignSlots.length; i++) {
            Slot storage other = campaignSlots[i];
            if (i != slotId && !other.paid && other.status != ProofStatus.Removed) reservedByOtherSlots += other.payout;
        }
        require(campaign.funded >= campaign.paid + campaign.withdrawn + reservedByOtherSlots, 'escrow accounting error');
        require(payout <= campaign.funded - campaign.paid - campaign.withdrawn - reservedByOtherSlots, 'fund additional USDC first');
        slot.payout = payout;
        emit SlotPayoutUpdated(campaignId, slotId, payout);
    }

    function removeKol(uint256 campaignId, uint256 slotId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.agency, 'agency only');
        require(block.timestamp < campaign.deadline, 'campaign closed');
        Slot storage slot = slots[campaignId][slotId];
        require(slot.status == ProofStatus.None || slot.status == ProofStatus.Rejected, 'slot cannot be removed now');
        address kol = slot.kol;
        slot.status = ProofStatus.Removed;
        slotFor[campaignId][kol] = 0;
        campaign.joined -= 1;
        emit SlotRemoved(campaignId, slotId, kol);
    }

    function submitProof(uint256 campaignId, string calldata proofUrl, string calldata note) external {
        Campaign storage campaign = campaigns[campaignId];
        require(block.timestamp < campaign.deadline, 'campaign closed');
        uint256 storedSlot = slotFor[campaignId][msg.sender];
        require(storedSlot > 0, 'not a KOL');
        Slot storage slot = slots[campaignId][storedSlot - 1];
        require(slot.status == ProofStatus.None || slot.status == ProofStatus.Rejected, 'proof not resubmittable');
        require(bytes(proofUrl).length >= 8, 'proof URL required');
        slot.proofUrl = proofUrl;
        slot.note = note;
        slot.rejectionReason = '';
        slot.submittedAt = block.timestamp;
        slot.status = ProofStatus.Pending;
        emit ProofSubmitted(campaignId, storedSlot - 1, proofUrl);
    }

    function approveProof(uint256 campaignId, uint256 slotId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.agency, 'agency only');
        Slot storage slot = slots[campaignId][slotId];
        require(slot.status == ProofStatus.Pending, 'proof not pending');
        slot.status = ProofStatus.Approved;
        slot.paid = true;
        campaign.paid += slot.payout;
        require(IERC20Minimal(campaign.token).transfer(slot.kol, slot.payout), 'payout transfer failed');
        emit ProofApproved(campaignId, slotId, slot.kol, slot.payout);
    }

    function rejectProof(uint256 campaignId, uint256 slotId, string calldata reason) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.agency, 'agency only');
        require(bytes(reason).length > 0, 'reason required');
        Slot storage slot = slots[campaignId][slotId];
        require(slot.status == ProofStatus.Pending, 'proof not pending');
        slot.status = ProofStatus.Rejected;
        slot.rejectionReason = reason;
        emit ProofRejected(campaignId, slotId, reason);
    }

    function claimAfterTimeout(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        uint256 storedSlot = slotFor[campaignId][msg.sender];
        require(storedSlot > 0, 'not a KOL');
        Slot storage slot = slots[campaignId][storedSlot - 1];
        require(slot.status == ProofStatus.Pending, 'proof not pending');
        require(block.timestamp >= slot.submittedAt + campaign.reviewTimeout, 'review timeout not reached');
        slot.status = ProofStatus.Claimed;
        slot.paid = true;
        campaign.paid += slot.payout;
        require(IERC20Minimal(campaign.token).transfer(msg.sender, slot.payout), 'payout transfer failed');
        emit PayoutClaimed(campaignId, storedSlot - 1, msg.sender, slot.payout);
    }

    function withdrawUnused(uint256 campaignId) external {
        Campaign storage campaign = campaigns[campaignId];
        require(msg.sender == campaign.agency, 'agency only');
        require(block.timestamp >= campaign.deadline, 'deadline not reached');
        uint256 pendingReserved;
        Slot[] storage campaignSlots = slots[campaignId];
        for (uint256 i = 0; i < campaignSlots.length; i++) {
            if (campaignSlots[i].status == ProofStatus.Pending) pendingReserved += campaignSlots[i].payout;
        }
        uint256 available = campaign.funded - campaign.paid - campaign.withdrawn - pendingReserved;
        require(available > 0, 'nothing to withdraw');
        campaign.withdrawn += available;
        require(IERC20Minimal(campaign.token).transfer(campaign.agency, available), 'refund transfer failed');
        emit UnusedBudgetWithdrawn(campaignId, available);
    }

    function campaignCount() external view returns (uint256) { return campaigns.length; }
    function getCampaign(uint256 campaignId) external view returns (Campaign memory) { return campaigns[campaignId]; }
    function getSlotCount(uint256 campaignId) external view returns (uint256) { return slots[campaignId].length; }
    function getSlot(uint256 campaignId, uint256 slotId) external view returns (Slot memory) { return slots[campaignId][slotId]; }
    function getSlotFor(uint256 campaignId, address kol) external view returns (uint256) { return slotFor[campaignId][kol]; }
}
