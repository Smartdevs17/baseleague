// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {BleagToken} from "../src/BleagToken.sol";
import {MatchManager} from "../src/MatchManager.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint16 platformFeeBps = uint16(vm.envOr("PLATFORM_FEE_BPS", uint256(0)));
        vm.startBroadcast(deployerPrivateKey);

        // Deploy BleagToken
        BleagToken bleagToken = new BleagToken();
        console.log("BleagToken deployed at:", address(bleagToken));

        // Deploy MatchManager
        MatchManager matchManager = new MatchManager(address(bleagToken), platformFeeBps);
        console.log("MatchManager deployed at:", address(matchManager));

        vm.stopBroadcast();
    }
}
