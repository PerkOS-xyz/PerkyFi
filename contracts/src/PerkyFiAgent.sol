// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC8004.sol";

/// @title PerkyFiAgent
/// @notice Helper contract for PerkyFi agent identity and reputation management
/// @dev Interacts with ERC-8004 contracts on Ethereum mainnet
contract PerkyFiAgent {
    // ERC-8004 contracts on Ethereum mainnet
    address public constant IDENTITY_REGISTRY = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432;
    address public constant REPUTATION_CONTRACT = 0x8004BAa17C55a88189AE136b182e5fdA19dE9b63;
    
    // Agent info
    address public owner;
    uint256 public agentId;
    string public agentName;
    
    // Stats
    uint256 public signalsGenerated;
    uint256 public tradesExecuted;
    uint256 public postsPublished;
    
    event SignalGenerated(string marketId, string recommendation, uint256 confidence);
    event TradeExecuted(address vault, uint256 amount, string action);
    event PostPublished(string platform, string postId);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(string memory _name) {
        owner = msg.sender;
        agentName = _name;
    }
    
    /// @notice Register agent with ERC-8004
    /// @param metadata IPFS hash with agent details
    function registerIdentity(string calldata metadata) external onlyOwner returns (uint256) {
        IERC8004Identity identity = IERC8004Identity(IDENTITY_REGISTRY);
        agentId = identity.register(agentName, metadata);
        return agentId;
    }
    
    /// @notice Log a signal generation for reputation
    /// @param marketId Polymarket market identifier
    /// @param recommendation deposit/withdraw/hold
    /// @param confidence Confidence score 0-100
    function logSignal(
        string calldata marketId,
        string calldata recommendation,
        uint256 confidence
    ) external onlyOwner {
        signalsGenerated++;
        
        IERC8004Reputation reputation = IERC8004Reputation(REPUTATION_CONTRACT);
        reputation.logAction(
            "signal",
            confidence >= 75,
            string(abi.encodePacked(marketId, ":", recommendation))
        );
        
        emit SignalGenerated(marketId, recommendation, confidence);
    }
    
    /// @notice Log a trade execution for reputation
    /// @param vault Morpho vault address
    /// @param amount USDC amount (6 decimals)
    /// @param action deposit/withdraw
    /// @param success Whether trade succeeded
    function logTrade(
        address vault,
        uint256 amount,
        string calldata action,
        bool success
    ) external onlyOwner {
        if (success) tradesExecuted++;
        
        IERC8004Reputation reputation = IERC8004Reputation(REPUTATION_CONTRACT);
        reputation.logAction("trade", success, action);
        
        emit TradeExecuted(vault, amount, action);
    }
    
    /// @notice Log a social post for reputation
    /// @param platform x/farcaster
    /// @param postId Platform-specific post ID
    function logPost(string calldata platform, string calldata postId) external onlyOwner {
        postsPublished++;
        
        IERC8004Reputation reputation = IERC8004Reputation(REPUTATION_CONTRACT);
        reputation.logAction("post", true, platform);
        
        emit PostPublished(platform, postId);
    }
    
    /// @notice Get agent stats
    function getStats() external view returns (
        uint256 signals,
        uint256 trades,
        uint256 posts
    ) {
        return (signalsGenerated, tradesExecuted, postsPublished);
    }
}
