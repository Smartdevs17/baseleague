// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {BLEAGToken} from "../src/BLEAGToken.sol";

contract DeployScript is Script {
    BLEAGToken public bleagToken;

    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        vm.startBroadcast(deployerPrivateKey);

        bleagToken = new BLEAGToken("BaseLeague Token", "$BLEAG", deployer);

        console.log("BLEAGToken deployed at: ", address(bleagToken));

        vm.stopBroadcast();
    }
}
