// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PerkyFiAgent.sol";

contract PerkyFiAgentTest is Test {
    PerkyFiAgent public agent;
    address public owner = address(this);
    
    function setUp() public {
        agent = new PerkyFiAgent("PerkyFi");
    }
    
    function testOwner() public view {
        assertEq(agent.owner(), owner);
    }
    
    function testAgentName() public view {
        assertEq(agent.agentName(), "PerkyFi");
    }
    
    function testInitialStats() public view {
        (uint256 signals, uint256 trades, uint256 posts) = agent.getStats();
        assertEq(signals, 0);
        assertEq(trades, 0);
        assertEq(posts, 0);
    }
    
    function testOnlyOwnerCanLogSignal() public {
        vm.prank(address(0x123));
        vm.expectRevert("Not owner");
        agent.logSignal("market1", "deposit", 80);
    }
}
