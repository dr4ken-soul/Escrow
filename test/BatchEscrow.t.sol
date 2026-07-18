// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BatchEscrow} from '../contracts/BatchEscrow.sol';
import {MockUSDC} from '../contracts/MockUSDC.sol';

contract BatchEscrowKol {
    function join(BatchEscrow escrow, uint256 campaignId) external {
        escrow.acceptSlot(campaignId);
    }

    function submit(BatchEscrow escrow, uint256 campaignId) external {
        escrow.submitProof(campaignId, 'https://x.com/example/status/1', 'live');
    }
}

contract BatchEscrowTest {
    function test_funded_campaign_records_budget() public {
        MockUSDC token = new MockUSDC();
        BatchEscrow escrow = new BatchEscrow();
        token.mint(address(this), 300e6);
        token.approve(address(escrow), 300e6);

        escrow.createCampaign(address(token), 'Launch week', 'One public post', 100e6, 3, block.timestamp + 7 days, 24 hours, false, bytes32(0));
        escrow.fundCampaign(0);

        BatchEscrow.Campaign memory campaign = escrow.getCampaign(0);
        require(campaign.agency == address(this), 'agency not recorded');
        require(campaign.maxSlots == 3, 'slot count not recorded');
        require(token.balanceOf(address(escrow)) == 300e6, 'budget not locked');
    }

    function test_agency_cannot_take_own_slot() public {
        MockUSDC token = new MockUSDC();
        BatchEscrow escrow = new BatchEscrow();
        token.mint(address(this), 100e6);
        token.approve(address(escrow), 100e6);
        escrow.createCampaign(address(token), 'Creator blocked', '', 100e6, 1, block.timestamp + 7 days, 1 hours, false, bytes32(0));
        escrow.fundCampaign(0);

        try escrow.acceptSlot(0) {
            revert('agency joined its own campaign');
        } catch {}
    }

    function test_adjusted_payout_requires_funding_and_settles() public {
        MockUSDC token = new MockUSDC();
        BatchEscrow escrow = new BatchEscrow();
        BatchEscrowKol kol = new BatchEscrowKol();
        token.mint(address(this), 150e6);
        token.approve(address(escrow), 100e6);
        escrow.createCampaign(address(token), 'Adjusted payout', '', 100e6, 1, block.timestamp + 7 days, 1 hours, false, bytes32(0));
        escrow.fundCampaign(0);
        kol.join(escrow, 0);

        try escrow.setSlotPayout(0, 0, 150e6) {
            revert('unfunded payout was accepted');
        } catch {}

        token.approve(address(escrow), 50e6);
        escrow.fundAdditional(0, 50e6);
        escrow.setSlotPayout(0, 0, 150e6);
        kol.submit(escrow, 0);
        escrow.approveProof(0, 0);

        BatchEscrow.Campaign memory campaign = escrow.getCampaign(0);
        require(campaign.paid == 150e6, 'paid amount not updated');
        require(campaign.funded - campaign.paid == 0, 'locked budget not reduced');
        require(token.balanceOf(address(kol)) == 150e6, 'kol was not paid');
    }
}
