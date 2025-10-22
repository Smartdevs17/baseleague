// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {BleagToken} from "../src/BleagToken.sol";
import {MatchManager} from "../src/MatchManager.sol";

contract MatchManagerTest is Test {
    BleagToken public bleagToken;
    MatchManager public matchManager;
    address public owner;
    address public user1;
    address public user2;
    address public user3;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        // Deploy contracts
        bleagToken = new BleagToken();
        // default 0 bps fee for existing tests
        matchManager = new MatchManager(address(bleagToken), 0);
        
        // Give users some tokens
        bleagToken.transfer(user1, 10000 * 10**18);
        bleagToken.transfer(user2, 10000 * 10**18);
        bleagToken.transfer(user3, 10000 * 10**18);
        
        // Users approve the match manager to spend their tokens
        vm.prank(user1);
        bleagToken.approve(address(matchManager), type(uint256).max);
        
        vm.prank(user2);
        bleagToken.approve(address(matchManager), type(uint256).max);
        
        vm.prank(user3);
        bleagToken.approve(address(matchManager), type(uint256).max);
    }

    function testCreateMatch() public {
        uint256 stake = 100 * 10**18;
        uint256 fixtureId = 12345;
        uint8 prediction = 1; // Draw
        
        vm.prank(user1);
        uint256 matchId = matchManager.createMatch(stake, fixtureId, prediction);
        
        assertEq(matchId, 1);
        
        MatchManager.Match memory match_ = matchManager.getMatch(matchId);
        assertEq(match_.creator, user1);
        assertEq(match_.stake, stake);
        assertEq(match_.fixtureId, fixtureId);
        assertEq(match_.creatorPrediction, prediction);
        assertEq(match_.joiner, address(0));
        assertEq(match_.settled, false);
    }

    function testJoinMatch() public {
        uint256 stake = 100 * 10**18;
        uint256 fixtureId = 12345;
        uint8 prediction1 = 1; // Draw
        uint8 prediction2 = 2; // Away win
        
        // User1 creates a match
        vm.prank(user1);
        uint256 matchId = matchManager.createMatch(stake, fixtureId, prediction1);
        
        // User2 joins the match
        vm.prank(user2);
        bool success = matchManager.joinMatch(matchId, prediction2);
        
        assertTrue(success);
        
        MatchManager.Match memory match_ = matchManager.getMatch(matchId);
        assertEq(match_.joiner, user2);
        assertEq(match_.joinerPrediction, prediction2);
    }

    function testSettleMatch() public {
        uint256 stake = 100 * 10**18;
        uint256 fixtureId = 12345;
        uint8 prediction1 = 1; // Draw
        uint8 prediction2 = 2; // Away win
        
        // Create and join match
        vm.prank(user1);
        uint256 matchId = matchManager.createMatch(stake, fixtureId, prediction1);
        
        vm.prank(user2);
        matchManager.joinMatch(matchId, prediction2);
        
        // Settle match with user1 as winner
        matchManager.settleMatch(matchId, user1);
        
        MatchManager.Match memory match_ = matchManager.getMatch(matchId);
        assertEq(match_.settled, true);
        assertEq(match_.winner, user1);
        
        // Check that user1 received the reward (2x stake) with 0 fee
        assertEq(bleagToken.balanceOf(user1), 10000 * 10**18 + stake);
    }

    function testSettleMatchWithFee() public {
        // Deploy a new manager with 500 bps (5%) fee
        matchManager = new MatchManager(address(bleagToken), 500);

        // Re-approve for new manager
        vm.prank(user1);
        bleagToken.approve(address(matchManager), type(uint256).max);
        vm.prank(user2);
        bleagToken.approve(address(matchManager), type(uint256).max);

        uint256 stake = 100 * 10**18;
        uint256 fixtureId = 12345;
        uint8 prediction1 = 1;
        uint8 prediction2 = 2;

        vm.prank(user1);
        uint256 matchId = matchManager.createMatch(stake, fixtureId, prediction1);

        vm.prank(user2);
        matchManager.joinMatch(matchId, prediction2);

        uint256 ownerBalBefore = bleagToken.balanceOf(owner);

        matchManager.settleMatch(matchId, user1);

        // reward = 200, fee=5% => 10, net=190
        uint256 expectedWinnerGain = 190 * 10**18;
        uint256 expectedOwnerGain = 10 * 10**18;

        // User1 balance: 10000e18 - stake + net
        assertEq(bleagToken.balanceOf(user1), 10000 * 10**18 - (100 * 10**18) + expectedWinnerGain);
        // Owner receives fee
        assertEq(bleagToken.balanceOf(owner) - ownerBalBefore, expectedOwnerGain);
    }

    function testOwnerCanUpdateFee() public {
        matchManager = new MatchManager(address(bleagToken), 0);
        vm.prank(user1);
        bleagToken.approve(address(matchManager), type(uint256).max);
        vm.prank(user2);
        bleagToken.approve(address(matchManager), type(uint256).max);

        // Update fee to 0.5%
        matchManager.setPlatformFeeBps(50);
        assertEq(matchManager.platformFeeBps(), 50);
    }

    function testGetUserMatches() public {
        uint256 stake = 100 * 10**18;
        uint256 fixtureId = 12345;
        
        // User1 creates multiple matches
        vm.prank(user1);
        uint256 matchId1 = matchManager.createMatch(stake, fixtureId, 1);
        
        vm.prank(user1);
        uint256 matchId2 = matchManager.createMatch(stake, fixtureId + 1, 2);
        
        uint256[] memory userMatches = matchManager.getUserMatches(user1);
        assertEq(userMatches.length, 2);
        assertEq(userMatches[0], matchId1);
        assertEq(userMatches[1], matchId2);
    }

    function testCannotJoinOwnMatch() public {
        uint256 stake = 100 * 10**18;
        uint256 fixtureId = 12345;
        
        vm.prank(user1);
        uint256 matchId = matchManager.createMatch(stake, fixtureId, 1);
        
        // User1 tries to join their own match
        vm.prank(user1);
        vm.expectRevert("Cannot join your own match");
        matchManager.joinMatch(matchId, 2);
    }

    function testCannotJoinNonExistentMatch() public {
        vm.prank(user2);
        vm.expectRevert("Match does not exist");
        matchManager.joinMatch(999, 1);
    }

    function testCannotJoinMatchWithJoiner() public {
        uint256 stake = 100 * 10**18;
        uint256 fixtureId = 12345;
        
        vm.prank(user1);
        uint256 matchId = matchManager.createMatch(stake, fixtureId, 1);
        
        vm.prank(user2);
        matchManager.joinMatch(matchId, 2);
        
        // User3 tries to join the same match
        vm.prank(user3);
        vm.expectRevert("Match already has a joiner");
        matchManager.joinMatch(matchId, 0);
    }

    function testInvalidPrediction() public {
        uint256 stake = 100 * 10**18;
        uint256 fixtureId = 12345;
        
        vm.prank(user1);
        vm.expectRevert("Invalid prediction");
        matchManager.createMatch(stake, fixtureId, 3); // Invalid prediction
    }

    function testZeroStake() public {
        uint256 fixtureId = 12345;
        
        vm.prank(user1);
        vm.expectRevert("Stake must be greater than 0");
        matchManager.createMatch(0, fixtureId, 1);
    }
}
