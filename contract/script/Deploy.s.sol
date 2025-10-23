// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {MatchManager} from "../src/MatchManager.sol";

contract DeployScript is Script {
    MatchManager public matchManager;

    address public bleagTokenAddress = vm.envAddress("BLEAG_TOKEN_ADDRESS");

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        matchManager = new MatchManager(bleagTokenAddress, msg.sender);

        console.log("MatchManager deployed at: ", address(matchManager));

        vm.stopBroadcast();
    }
}
