// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

contract RPS {
    constructor() {
        console.log("Deploying RPS");
    }

    // Valid choices are uint8 values 1, 2, 3
    // Choice 0 is null (uninitialized value)
    uint8 constant NULL = 0;
    uint8 constant ROCK = 1;
    uint8 constant PAPER = 2;
    uint8 constant SCISSORS = 3;

    struct Player {
        bool initialized;
        uint wins;
        uint losses;
        int256 winnings;
    }

    struct Game {
        address payable player1;
        address payable player2;
        string player1Name;
        string player2Name;
        uint bet;
        bytes32 p1Commit;
        bytes32 p2Commit;
        uint8 p1Choice;
        uint8 p2Choice;
        address winner;
        // 0 = Not started
        // 1 = Waiting for player 2
        // 2 = Waiting for moves
        // 3 = Game finished
        // 4 = Game cancelled
        uint8 gameState;
    }

    mapping(address => Player) public players;
    mapping(bytes32 => Game) public games;

    uint numCommitments = 0;
    uint numMoves = 0;

    event requestMoves(bytes32 gameId);
    event winner(bytes32 gameId, address winner);
    event gameCancel(bytes32 gameId);

    /// Creates a new game with the given players and bets. Initializes the game with null choices,
    /// which will be updated when the players make their moves.
    /// @param _player1 address payable of the first player
    /// @param _player1Name string of the first player's username
    /// @param _bet uint amount of wei to bet for the game
    /// @param _id uint id of the game
    function _createGame(address payable _player1, string calldata _player1Name, uint _bet, bytes32 _id) internal {
        games[_id] = Game(_player1, payable(0), _player1Name, "", _bet, 0, 0, NULL, NULL, address(0), 0);
    }

    /// Returns the game with the given id.
    /// @param _id uint id of the game
    function getGameDetails(bytes32 _id) public view returns (Game memory) {
        require(games[_id].gameState != 0, "Game not started");
        return games[_id];
    }

    /// Returns details about the specified player in the following order:
    ///  - player wins
    ///  - player losses
    ///  - player winnings
    /// @param _player address of the player
    function getPlayerDetails(address _player) public view returns (uint, uint, int256) {
        require(players[_player].initialized, "Player does not exist");
        return (players[_player].wins, players[_player].losses, players[_player].winnings);
    }

    /// Creates a new player with the given name.
    /// Does NOT make sure that the player doesn't already exist.
    /// @param _player: address payable of the player
    function _registerPlayer(address payable _player) internal {
        players[_player] = Player(true, 0, 0, 0);
    }

    /// Processes a refund request. Refunds are only processed if the game is unfinished.
    /// In other words, it requires that the gameState is either 1 (waiting for player 2) or 2 (waiting for moves).
    /// @param _id: bytes32 id of the game
    function requestRefund(bytes32 _id) external {
        require(games[_id].player1 == msg.sender || games[_id].player2 == msg.sender, "You are not a player in this game");
        require(games[_id].gameState == 1 || games[_id].gameState == 2, "The game is already finished");
        uint bet = games[_id].bet;
        emit gameCancel(_id);

        if (bet == 0) {
            games[_id].gameState = 4;
            return;
        }

        if (games[_id].gameState == 1) {
            // gameState 1 means only player 1 has sent a commit, so we only refund to them
            // Set gameState to 4 to prevent further refunds (re-entrancy attack)
            games[_id].gameState = 4;
            (bool sent,) = games[_id].player1.call{value: bet}("");
            require(sent, "Failed to refund Ether");
        } else if (games[_id].gameState == 2) {
            // gameState 2 means both players have sent a commit, so we refund to both
            // Set gameState to 4 to prevent further refunds (re-entrancy attack)
            games[_id].gameState = 4;
            (bool sent,) = games[_id].player1.call{value: bet}("");
            (bool sent2,) = games[_id].player2.call{value: bet}("");
            require(sent && sent2, "Failed to refund Ether");
        }
    }

    /// Attempts to commit to the game with the given id. If the game doesn't exist, a new game is created with that id
    /// with msg.sender set as player 1. If it exists, msg.sender is set as player 2.
    /// In both cases, their respective commits are set and the bet ETH is transferred.
    ///
    /// The commit should be the Keccak256 digest of the nonce + the player's choice (in that order).
    /// @param _id uint id of the game
    /// @param _commit bytes32 commit to the game (comprised of choice + nonce)
    /// @param _playerName string of the player's username (modifies the existing name if it already exists)
    function sendCommitment(bytes32 _id, bytes32 _commit, string calldata _playerName) external payable {
        require(games[_id].gameState < 3, "The game is already finished");
        // Check if player already exists
        if (!players[msg.sender].initialized) {
            _registerPlayer(payable(msg.sender));
        }

        require(games[_id].gameState <= 1, "You have already committed");
        if (games[_id].gameState == 0) {
            _createGame(payable(msg.sender), _playerName, msg.value, _id);
            games[_id].p1Commit = _commit;
            games[_id].gameState = 1;
        } else if (games[_id].gameState == 1) {
            require(games[_id].player1 != msg.sender, "You have already committed");
            require(games[_id].bet == msg.value, "You must bet the same amount as the other player");
            games[_id].player2 = payable(msg.sender);
            games[_id].player2Name = _playerName;
            games[_id].p2Commit = _commit;
            games[_id].gameState = 2;
            // Now get players to confirm their moves on the blockchain
            emit requestMoves(_id);
        }
    }

    /// Confirms a player's move by submitting both their choice and nonce that were used in the initial commitment.
    /// When both players have confirmed their moves, the winner is determined.
    /// If the choice and/or nonce do not match the one in the commitment, the function will revert.
    /// @param _id uint id of the game
    /// @param _choice uint choice of the player
    /// @param _nonce bytes32 nonce of the player
    function sendVerification(bytes32 _id, uint8 _choice, uint _nonce) external {
        require(games[_id].gameState == 2, "Both players must commit first");
        require(games[_id].gameState < 3, "The game is already finished");
        require(msg.sender == games[_id].player1 || msg.sender == games[_id].player2, "You are not a player in this game");

        if (msg.sender == games[_id].player1) {
            require(games[_id].p1Choice == 0, "You have already verified your choice");
            require(keccak256(abi.encodePacked(_nonce, _choice)) == games[_id].p1Commit, "Your choice does not match the commitment");
            games[_id].p1Choice = _choice;
        } else {
            require(games[_id].p2Choice == 0, "You have already verified your choice");
            require(keccak256(abi.encodePacked(_nonce, _choice)) == games[_id].p2Commit, "Your choice does not match the commitment");
            games[_id].p2Choice = _choice;
        }

        if (games[_id].p1Choice != 0 && games[_id].p2Choice != 0) {
            emit winner(_id, _determineWinner(_id));
        }
    }

    /// Determines the winner of the game. Run automatically when both players have confirmed their moves.
    /// Sets the game state to 3 to indicate that the game is over. Gives winnings to the winner.
    /// @param _id uint id of the game
    /// @return address of the winner
    function _determineWinner(bytes32 _id) internal returns (address) {
        assert(games[_id].gameState == 2);  // Should never run
        address payable winnerAddr;
        address payable loserAddr;
        address payable p1 = games[_id].player1;
        address payable p2 = games[_id].player2;
        uint8 p1Choice = games[_id].p1Choice;
        uint8 p2Choice = games[_id].p2Choice;

        if (p1Choice == ROCK && p2Choice == PAPER) {
            winnerAddr = p2;
            loserAddr = p1;
        } else if (p2Choice == ROCK && p1Choice == PAPER) {
            winnerAddr = p1;
            loserAddr = p2;
        } else if (p1Choice == SCISSORS && p2Choice == PAPER) {
            winnerAddr = p1;
            loserAddr = p2;
        } else if (p2Choice == SCISSORS && p1Choice == PAPER) {
            winnerAddr = p2;
            loserAddr = p1;
        } else if (p1Choice == ROCK && p2Choice == SCISSORS) {
            winnerAddr = p1;
            loserAddr = p2;
        } else if (p2Choice == ROCK && p1Choice == SCISSORS) {
            winnerAddr = p2;
            loserAddr = p1;
        } else {
            winnerAddr = payable(0);
            loserAddr = payable(0);
        }

        // Set the gameState to 3 to prevent re-entracy attacks
        // since this function reverts if gameState is not 2.
        games[_id].gameState = 3;
        games[_id].winner = winnerAddr;

        // Use call to send ether according to https://solidity-by-example.org/sending-ether/
        uint bet = games[_id].bet;
        if (winnerAddr == payable(0)) {
            if (bet != 0) {
                (bool sent,) = p1.call{value: bet}("");
                (bool sent2,) = p2.call{value: bet}("");
                require(sent && sent2, "Failed to send Ether");
            }
        } else {
            if (bet != 0) {
                (bool sent,) = winnerAddr.call{value: 2 * bet}("");
                require(sent, "Failed to send Ether");
            }
            players[winnerAddr].winnings += int256(bet);
            players[winnerAddr].wins++;
            players[loserAddr].winnings -= int256(bet);
            players[loserAddr].losses++;

        }
        return winnerAddr;
    }
}