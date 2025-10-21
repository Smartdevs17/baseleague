// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BleagToken
 * @dev ERC20 token for the BaseLeague platform
 */
contract BleagToken is ERC20, Ownable {
    constructor() ERC20("Bleag Token", "BLEAG") Ownable(msg.sender) {
        // Mint initial supply to the deployer
        _mint(msg.sender, 1000000 * 10**decimals());
    }

    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
