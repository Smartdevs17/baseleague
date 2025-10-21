// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {BleagToken} from "../src/BleagToken.sol";

contract BleagTokenTest is Test {
    BleagToken public bleagToken;
    address public owner;
    address public user1;
    address public user2;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        bleagToken = new BleagToken();
    }

    function testInitialSupply() public {
        uint256 expectedSupply = 1000000 * 10**18; // 1M tokens with 18 decimals
        assertEq(bleagToken.totalSupply(), expectedSupply);
        assertEq(bleagToken.balanceOf(owner), expectedSupply);
    }

    function testMint() public {
        uint256 mintAmount = 1000 * 10**18;
        uint256 initialBalance = bleagToken.balanceOf(user1);
        
        bleagToken.mint(user1, mintAmount);
        
        assertEq(bleagToken.balanceOf(user1), initialBalance + mintAmount);
    }

    function testBurn() public {
        uint256 burnAmount = 100 * 10**18;
        uint256 initialBalance = bleagToken.balanceOf(owner);
        
        bleagToken.burn(burnAmount);
        
        assertEq(bleagToken.balanceOf(owner), initialBalance - burnAmount);
    }

    function testTransfer() public {
        uint256 transferAmount = 1000 * 10**18;
        
        bleagToken.transfer(user1, transferAmount);
        
        assertEq(bleagToken.balanceOf(user1), transferAmount);
        assertEq(bleagToken.balanceOf(owner), 1000000 * 10**18 - transferAmount);
    }

    function testApproveAndTransferFrom() public {
        uint256 approveAmount = 1000 * 10**18;
        uint256 transferAmount = 500 * 10**18;
        
        // Owner approves user1 to spend tokens
        bleagToken.approve(user1, approveAmount);
        assertEq(bleagToken.allowance(owner, user1), approveAmount);
        
        // User1 transfers tokens on behalf of owner
        vm.prank(user1);
        bleagToken.transferFrom(owner, user2, transferAmount);
        
        assertEq(bleagToken.balanceOf(user2), transferAmount);
        assertEq(bleagToken.allowance(owner, user1), approveAmount - transferAmount);
    }
}
