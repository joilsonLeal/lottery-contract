// SPDX-License-Identifier: MIT
pragma solidity ^0.4.17;

contract Lottery {
  address public manager;
  address[] public players;

  constructor() public {
    manager = msg.sender;
  }

  modifier onlyManager() {
    require(msg.sender == manager, "Must be the manager to call this function!");
    _;
  }

  function enter() public payable {
    require(msg.value > .01 ether, "You must enter at least 0.01 ether!");
    players.push(msg.sender);
  }

  function random() private view returns (uint256) {
    return
      uint256(
        keccak256(
          abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
          )
        )
      );
  }

  function pickWinner() public onlyManager() {
    uint index = random() % players.length;
    players[index].transfer(address(this).balance);
    players = new address[](0);
  }
}
