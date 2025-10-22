// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MatchManager
 * @dev Manages betting matches between users
 */
contract MatchManager is Ownable {
    using SafeERC20 for IERC20;

    // Match structure
    struct Match {
        address creator;
        address joiner;
        uint256 stake;
        uint256 fixtureId;
        uint8 creatorPrediction;
        uint8 joinerPrediction;
        bool settled;
        address winner;
    }

    // State variables
    IERC20 public immutable bleagToken;
    uint16 public platformFeeBps; // fee in basis points (1% = 100 bps)
    uint16 public constant MAX_BPS = 10_000;
    uint256 public nextMatchId = 1;
    mapping(uint256 => Match) public matches;
    mapping(address => uint256[]) public userMatches;

    // Events
    event MatchCreated(uint256 indexed matchId, address indexed creator, uint256 stake, uint256 fixtureId);
    event MatchJoined(uint256 indexed matchId, address indexed joiner);
    event MatchSettled(uint256 indexed matchId, address indexed winner, uint256 reward);
    event PlatformFeeUpdated(uint16 oldFeeBps, uint16 newFeeBps);

    constructor(address _bleagToken, uint16 _platformFeeBps) Ownable(msg.sender) {
        require(_platformFeeBps <= MAX_BPS, "Fee too high");
        bleagToken = IERC20(_bleagToken);
        platformFeeBps = _platformFeeBps;
    }

    /**
     * @dev Create a new match
     * @param stake Amount of tokens to stake
     * @param fixtureId ID of the fixture being bet on
     * @param prediction User's prediction (0 = home win, 1 = draw, 2 = away win)
     * @return matchId ID of the created match
     */
    function createMatch(uint256 stake, uint256 fixtureId, uint8 prediction) external returns (uint256) {
        require(stake > 0, "Stake must be greater than 0");
        require(prediction <= 2, "Invalid prediction");

        // Transfer tokens from creator to contract
        bleagToken.safeTransferFrom(msg.sender, address(this), stake);

        uint256 matchId = nextMatchId++;
        matches[matchId] = Match({
            creator: msg.sender,
            joiner: address(0),
            stake: stake,
            fixtureId: fixtureId,
            creatorPrediction: prediction,
            joinerPrediction: 0,
            settled: false,
            winner: address(0)
        });

        userMatches[msg.sender].push(matchId);

        emit MatchCreated(matchId, msg.sender, stake, fixtureId);
        return matchId;
    }

    /**
     * @dev Join an existing match
     * @param matchId ID of the match to join
     * @param prediction User's prediction
     * @return success Whether the join was successful
     */
    function joinMatch(uint256 matchId, uint8 prediction) external returns (bool) {
        Match storage match_ = matches[matchId];
        require(match_.creator != address(0), "Match does not exist");
        require(match_.joiner == address(0), "Match already has a joiner");
        require(match_.creator != msg.sender, "Cannot join your own match");
        require(prediction <= 2, "Invalid prediction");

        // Transfer tokens from joiner to contract
        bleagToken.safeTransferFrom(msg.sender, address(this), match_.stake);

        match_.joiner = msg.sender;
        match_.joinerPrediction = prediction;

        userMatches[msg.sender].push(matchId);

        emit MatchJoined(matchId, msg.sender);
        return true;
    }

    /**
     * @dev Get match details
     * @param matchId ID of the match
     * @return match_ Match details
     */
    function getMatch(uint256 matchId) external view returns (Match memory) {
        return matches[matchId];
    }

    /**
     * @dev Get all matches for a user
     * @param user User address
     * @return matchIds Array of match IDs
     */
    function getUserMatches(address user) external view returns (uint256[] memory) {
        return userMatches[user];
    }

    /**
     * @dev Settle a match (only owner)
     * @param matchId ID of the match to settle
     * @param winner Address of the winner
     */
    function settleMatch(uint256 matchId, address winner) external onlyOwner {
        Match storage match_ = matches[matchId];
        require(match_.creator != address(0), "Match does not exist");
        require(!match_.settled, "Match already settled");
        require(match_.joiner != address(0), "Match has no joiner");
        require(winner == match_.creator || winner == match_.joiner, "Invalid winner");

        match_.settled = true;
        match_.winner = winner;

        // Calculate reward (2x stake), fee, and net amount
        uint256 reward = match_.stake * 2;
        uint256 fee = (reward * platformFeeBps) / MAX_BPS;
        uint256 net = reward - fee;

        // Transfer fee to owner and net reward to winner
        if (fee > 0) {
            bleagToken.safeTransfer(owner(), fee);
        }
        bleagToken.safeTransfer(winner, net);

        emit MatchSettled(matchId, winner, net);
    }

    /**
     * @dev Emergency withdraw (only owner)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        bleagToken.safeTransfer(owner(), amount);
    }

    /**
     * @dev Update platform fee (only owner)
     * @param _platformFeeBps New fee in basis points
     */
    function setPlatformFeeBps(uint16 _platformFeeBps) external onlyOwner {
        require(_platformFeeBps <= MAX_BPS, "Fee too high");
        uint16 old = platformFeeBps;
        platformFeeBps = _platformFeeBps;
        emit PlatformFeeUpdated(old, _platformFeeBps);
    }
}
