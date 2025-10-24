// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./BLEAGToken.sol";

/**
 * @title MatchManager
 * @dev Manages FPL matches, staking, and payouts for BaseLeague
 * @author BaseLeague Team
 */
contract MatchManager is Ownable, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    // Enums
    enum MatchStatus { Open, Active, Completed, Cancelled }
    enum Prediction { Home, Draw, Away }
    enum MatchResult { Home, Draw, Away, NotSet }
    
    // Structs
    struct Match {
        uint256 id;
        address creator;
        address joiner;
        uint256 stakeAmount;
        string fixtureId;
        Prediction creatorPrediction;
        Prediction joinerPrediction;
        MatchStatus status;
        MatchResult result;
        uint256 createdAt;
        uint256 completedAt;
        bool isSettled;
    }
    
    struct UserStats {
        uint256 totalMatches;
        uint256 wins;
        uint256 losses;
        uint256 totalStaked;
        uint256 totalWinnings;
        uint256 winRate;
    }
    
    // State variables
    IERC20 public immutable bleagToken;
    address public immutable platformFeeRecipient;
    
    uint256 public nextMatchId = 1;
    uint256 public platformFeePercentage = 500;
    uint256 public constant MAX_FEE_PERCENTAGE = 1000;
    
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SETTLER_ROLE = keccak256("SETTLER_ROLE");
    
    // Mappings
    mapping(uint256 => Match) public matches;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256[]) public userMatches;
    mapping(string => bool) public validFixtures;
    
    // Arrays for efficient querying
    uint256[] public openMatches;
    uint256[] public activeMatches;
    uint256[] public completedMatches;
    
    // Events
    event MatchCreated(
        uint256 indexed matchId,
        address indexed creator,
        uint256 stakeAmount,
        string fixtureId,
        Prediction prediction
    );
    
    event MatchJoined(
        uint256 indexed matchId,
        address indexed joiner,
        Prediction prediction
    );
    
    event MatchSettled(
        uint256 indexed matchId,
        address indexed winner,
        uint256 payout,
        MatchResult result
    );
    
    event MatchCancelled(uint256 indexed matchId, address indexed creator);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FixtureValidated(string indexed fixtureId, bool isValid);
    
    // Modifiers
    modifier onlyValidMatch(uint256 matchId) {
        require(matchId > 0 && matchId < nextMatchId, "MatchManager: Invalid match ID");
        _;
    }
    
    modifier onlyMatchCreator(uint256 matchId) {
        require(matches[matchId].creator == msg.sender, "MatchManager: Not match creator");
        _;
    }
    
    modifier onlyValidFixture(string memory fixtureId) {
        require(validFixtures[fixtureId], "MatchManager: Invalid fixture");
        _;
    }
    
    constructor(address _bleagToken, address _platformFeeRecipient) Ownable(msg.sender) {
        bleagToken = IERC20(_bleagToken);
        platformFeeRecipient = _platformFeeRecipient;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(SETTLER_ROLE, msg.sender);
    }
    
    /**
     * @dev Create a new match
     * @param fixtureId External fixture ID from backend
     * @param prediction Creator's prediction
     * @param stakeAmount Amount to stake
     */
    function createMatch(
        string memory fixtureId,
        Prediction prediction,
        uint256 stakeAmount
    ) external nonReentrant {
        require(stakeAmount > 0, "MatchManager: Invalid stake amount");
        require(bleagToken.balanceOf(msg.sender) >= stakeAmount, "MatchManager: Insufficient balance");
        require(bleagToken.allowance(msg.sender, address(this)) >= stakeAmount, "MatchManager: Insufficient allowance");
        
        // Transfer tokens to contract
        bleagToken.safeTransferFrom(msg.sender, address(this), stakeAmount);
        
        // Create match
        Match storage newMatch = matches[nextMatchId];
        newMatch.id = nextMatchId;
        newMatch.creator = msg.sender;
        newMatch.stakeAmount = stakeAmount;
        newMatch.fixtureId = fixtureId;
        newMatch.creatorPrediction = prediction;
        newMatch.status = MatchStatus.Open;
        newMatch.createdAt = block.timestamp;
        
        // Add to user's matches and open matches
        userMatches[msg.sender].push(nextMatchId);
        openMatches.push(nextMatchId);
        
        emit MatchCreated(nextMatchId, msg.sender, stakeAmount, fixtureId, prediction);
        
        nextMatchId++;
    }
    
    /**
     * @dev Join an existing match
     * @param matchId ID of the match to join
     * @param prediction Joiner's prediction (must be different from creator's)
     */
    function joinMatch(uint256 matchId, Prediction prediction) 
        external 
        onlyValidMatch(matchId) 
        nonReentrant 
    {
        Match storage match_ = matches[matchId];
        require(match_.status == MatchStatus.Open, "MatchManager: Match not open");
        require(match_.creator != msg.sender, "MatchManager: Cannot join own match");
        require(match_.creatorPrediction != prediction, "MatchManager: Cannot choose same prediction");
        
        require(bleagToken.balanceOf(msg.sender) >= match_.stakeAmount, "MatchManager: Insufficient balance");
        require(bleagToken.allowance(msg.sender, address(this)) >= match_.stakeAmount, "MatchManager: Insufficient allowance");
        
        // Transfer tokens to contract
        bleagToken.safeTransferFrom(msg.sender, address(this), match_.stakeAmount);
        
        // Update match
        match_.joiner = msg.sender;
        match_.joinerPrediction = prediction;
        match_.status = MatchStatus.Active;
        
        // Update arrays
        _removeFromOpenMatches(matchId);
        activeMatches.push(matchId);
        
        // Add to user's matches
        userMatches[msg.sender].push(matchId);
        
        emit MatchJoined(matchId, msg.sender, prediction);
    }
    
    /**
     * @dev Settle a match (admin only)
     * @param matchId ID of the match to settle
     * @param result Match result
     */
    function settleMatch(uint256 matchId, MatchResult result) 
        external 
        onlyRole(SETTLER_ROLE)
        onlyValidMatch(matchId) 
        nonReentrant 
    {
        Match storage match_ = matches[matchId];
        require(match_.status == MatchStatus.Active, "MatchManager: Match not active");
        require(result != MatchResult.NotSet, "MatchManager: Invalid result");
        
        match_.result = result;
        match_.status = MatchStatus.Completed;
        match_.completedAt = block.timestamp;
        
        // Determine winner and calculate payouts
        address winner;
        uint256 totalStake = match_.stakeAmount * 2;
        uint256 platformFee = (totalStake * platformFeePercentage) / 10000;
        uint256 winnerPayout = totalStake - platformFee;
        
        if (result == MatchResult.Home) {
            winner = match_.creatorPrediction == Prediction.Home ? match_.creator : match_.joiner;
        } else if (result == MatchResult.Draw) {
            winner = match_.creatorPrediction == Prediction.Draw ? match_.creator : match_.joiner;
        } else { // Away
            winner = match_.creatorPrediction == Prediction.Away ? match_.creator : match_.joiner;
        }
        
        // Update user stats
        _updateUserStats(winner, match_.stakeAmount, winnerPayout, true);
        _updateUserStats(winner == match_.creator ? match_.joiner : match_.creator, match_.stakeAmount, 0, false);
        
        // Transfer winnings
        if (winnerPayout > 0) {
            bleagToken.safeTransfer(winner, winnerPayout);
        }
        
        // Transfer platform fee
        if (platformFee > 0) {
            bleagToken.safeTransfer(platformFeeRecipient, platformFee);
        }
        
        // Update arrays
        _removeFromActiveMatches(matchId);
        completedMatches.push(matchId);
        
        match_.isSettled = true;
        
        emit MatchSettled(matchId, winner, winnerPayout, result);
    }
    
    /**
     * @dev Cancel a match (only creator, before joiner)
     */
    function cancelMatch(uint256 matchId) 
        external 
        onlyValidMatch(matchId) 
        onlyMatchCreator(matchId) 
        nonReentrant 
    {
        Match storage match_ = matches[matchId];
        require(match_.status == MatchStatus.Open, "MatchManager: Match not open");
        
        match_.status = MatchStatus.Cancelled;
        
        // Refund creator
        bleagToken.safeTransfer(match_.creator, match_.stakeAmount);
        
        // Update arrays
        _removeFromOpenMatches(matchId);
        
        emit MatchCancelled(matchId, match_.creator);
    }
    
    /**
     * @dev Get match details
     */
    function getMatch(uint256 matchId) external view onlyValidMatch(matchId) returns (Match memory) {
        return matches[matchId];
    }
    
    /**
     * @dev Get user's matches
     */
    function getUserMatches(address user) external view returns (uint256[] memory) {
        return userMatches[user];
    }
    
    /**
     * @dev Get open matches
     */
    function getOpenMatches() external view returns (uint256[] memory) {
        return openMatches;
    }
    
    /**
     * @dev Get active matches
     */
    function getActiveMatches() external view returns (uint256[] memory) {
        return activeMatches;
    }
    
    /**
     * @dev Get completed matches
     */
    function getCompletedMatches() external view returns (uint256[] memory) {
        return completedMatches;
    }
    
    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) external view returns (UserStats memory) {
        return userStats[user];
    }
    
    /**
     * @dev Validate a fixture (admin only)
     */
    function validateFixture(string memory fixtureId, bool isValid) external onlyRole(ADMIN_ROLE) {
        validFixtures[fixtureId] = isValid;
        emit FixtureValidated(fixtureId, isValid);
    }
    
    /**
     * @dev Set platform fee percentage (admin only)
     */
    function setPlatformFee(uint256 _feePercentage) external onlyRole(ADMIN_ROLE) {
        require(_feePercentage <= MAX_FEE_PERCENTAGE, "MatchManager: Fee too high");
        uint256 oldFee = platformFeePercentage;
        platformFeePercentage = _feePercentage;
        emit PlatformFeeUpdated(oldFee, _feePercentage);
    }
    
    /**
     * @dev Grant admin role to an address
     */
    function grantAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ADMIN_ROLE, account);
    }
    
    /**
     * @dev Grant settler role to an address
     */
    function grantSettlerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(SETTLER_ROLE, account);
    }
    
    /**
     * @dev Revoke admin role from an address
     */
    function revokeAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ADMIN_ROLE, account);
    }
    
    /**
     * @dev Revoke settler role from an address
     */
    function revokeSettlerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(SETTLER_ROLE, account);
    }
    
    /**
     * @dev Check if address has admin role
     */
    function hasAdminRole(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }
    
    /**
     * @dev Check if address has settler role
     */
    function hasSettlerRole(address account) external view returns (bool) {
        return hasRole(SETTLER_ROLE, account);
    }
    
    /**
     * @dev Update user statistics
     */
    function _updateUserStats(address user, uint256 staked, uint256 winnings, bool won) internal {
        UserStats storage stats = userStats[user];
        stats.totalMatches++;
        stats.totalStaked += staked;
        
        if (won) {
            stats.wins++;
            stats.totalWinnings += winnings;
        } else {
            stats.losses++;
        }
        
        // Calculate win rate in basis points
        if (stats.totalMatches > 0) {
            stats.winRate = (stats.wins * 10000) / stats.totalMatches;
        }
    }
    
    /**
     * @dev Remove match from open matches array
     */
    function _removeFromOpenMatches(uint256 matchId) internal {
        for (uint256 i = 0; i < openMatches.length; i++) {
            if (openMatches[i] == matchId) {
                openMatches[i] = openMatches[openMatches.length - 1];
                openMatches.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Remove match from active matches array
     */
    function _removeFromActiveMatches(uint256 matchId) internal {
        for (uint256 i = 0; i < activeMatches.length; i++) {
            if (activeMatches[i] == matchId) {
                activeMatches[i] = activeMatches[activeMatches.length - 1];
                activeMatches.pop();
                break;
            }
        }
    }
}
