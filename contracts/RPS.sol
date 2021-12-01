// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

// to-do: Implement ETH betting logic. Fix contract crashing after one game played.
// Figure out event listening on frontend

contract RPS {
  constructor() {
        console.log("Deploying RPS");
    }
  bytes32 constant ROCK = "ROCK";
  bytes32 constant PAPER = "PAPER";
  bytes32 constant SCISSORS = "SCISSORS";
  // NULL:     0x0000000000000000000000000000000000000000000000000000000000000000
  // ROCK:     0x524f434b00000000000000000000000000000000000000000000000000000000
  // PAPER:    0x5041504552000000000000000000000000000000000000000000000000000000
  // SCISSORS: 0x53434953534f5253000000000000000000000000000000000000000000000000

  // ALICE SALT:  5238424923423482
  // BOB SALT:    1214142342342342

  struct Move {
      bytes32 salt;
      bytes32 choice;
  }
  mapping(address => Move) public Moves;
  mapping(address => bytes32) public commitments;
  uint numCommitments = 0;
  uint numMoves = 0;
  address[] players;
  event requestMoves();
  event winner(address winner);
  
  function encrypt(bytes32 choice, bytes32 salt) internal pure returns (bytes32) {
      return keccak256(abi.encodePacked(salt, choice));
  }

  function stringToBytes32(string memory source) internal pure returns (bytes32 result) {
      bytes memory tempEmptyStringTest = bytes(source);
      if (tempEmptyStringTest.length == 0) {
          return 0x0;
      }
      assembly {
          result := mload(add(source, 32))
      }
  }    

  function sendCommitment(string calldata choice, string calldata salt) external {
      bytes32 commitment = encrypt(stringToBytes32(choice), stringToBytes32(salt));
      require(commitments[msg.sender] == bytes32(0)); // make sure player hasnt played before
      require(numCommitments < 2);
      require(players.length < 2);
      players.push(payable(msg.sender));
      commitments[msg.sender] = commitment;
      numCommitments++;
      if (numCommitments == 2) {
          emit requestMoves();
      }
  }

  function sendMove(string calldata playerChoice, string calldata playerSalt) external {
      require(numCommitments == 2);
      bytes32 salt = stringToBytes32(playerSalt);
      bytes32 choice = stringToBytes32(playerChoice);
      // Check that the player's choice and salt matches their commitment
      require(keccak256(abi.encodePacked(salt, choice)) == commitments[msg.sender]);
      Moves[msg.sender] = Move(salt, choice);
      numMoves++;
      if (numMoves == 2) {
          emit winner(determineWinner());
      }
  }

  function determineWinner() public view returns (address) {
      address alice = players[0];
      address bob = players[1];
      bytes32 aliceChoice = Moves[alice].choice;
      bytes32 bobChoice = Moves[bob].choice;
      
      if (aliceChoice == bobChoice) {
          return address(0);
      }
      if (aliceChoice == ROCK && bobChoice == PAPER) {
          return bob;
      } else if (bobChoice == ROCK && aliceChoice == PAPER) {
          return alice;
      } else if (aliceChoice == SCISSORS && bobChoice == PAPER) {
          return alice;
      } else if (bobChoice == SCISSORS && aliceChoice == PAPER) {
          return bob;
      } else if (aliceChoice == ROCK && bobChoice == SCISSORS) {
          return alice;
      } else if (bobChoice == ROCK && aliceChoice == SCISSORS) {
          return bob;
      }
  }
}