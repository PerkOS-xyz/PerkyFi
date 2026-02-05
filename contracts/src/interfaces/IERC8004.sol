// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IERC8004 - Trustless Agent Identity Interface
/// @notice Interface for ERC-8004 identity registry
interface IERC8004Identity {
    /// @notice Register a new agent identity
    /// @param name Human-readable name for the agent
    /// @param metadata IPFS hash or URL for agent metadata
    function register(string calldata name, string calldata metadata) external returns (uint256 agentId);
    
    /// @notice Get agent info by ID
    /// @param agentId The agent's unique identifier
    function getAgent(uint256 agentId) external view returns (
        address owner,
        string memory name,
        string memory metadata,
        uint256 createdAt
    );
    
    /// @notice Get agent ID by address
    /// @param agent The agent's address
    function getAgentId(address agent) external view returns (uint256);
    
    /// @notice Check if address is a registered agent
    /// @param agent The address to check
    function isRegistered(address agent) external view returns (bool);
}

/// @title IERC8004Reputation - Trustless Agent Reputation Interface
/// @notice Interface for ERC-8004 reputation tracking
interface IERC8004Reputation {
    /// @notice Log an action for reputation tracking
    /// @param actionType Type of action (e.g., "trade", "post", "signal")
    /// @param success Whether the action was successful
    /// @param metadata Additional action metadata
    function logAction(string calldata actionType, bool success, string calldata metadata) external;
    
    /// @notice Get agent's reputation score
    /// @param agentId The agent's unique identifier
    function getReputation(uint256 agentId) external view returns (
        uint256 successCount,
        uint256 failureCount,
        uint256 score
    );
}
