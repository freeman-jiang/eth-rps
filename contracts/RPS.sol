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
        string name;
        uint wins;
        uint losses;
    }

    struct Game {
        address payable player1;
        address payable player2;
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
        uint8 gameState;
    }

    mapping(address => Player) public players;
    mapping(bytes32 => Game) public games;

    uint numCommitments = 0;
    uint numMoves = 0;

    event requestMoves(bytes32 gameId);
    event winner(bytes32 gameId, address winner);
    event betValue(bytes32 gameId, uint bet);
    event gameCancel(bytes32 gameId);

    /// Creates a new game with the given players and bets. Initializes the game with null choices,
    /// which will be updated when the players make their moves.
    /// @param _player1 address payable of the first player
    /// @param _player2 address payable of the second player
    /// @param _bet uint amount of wei to bet for the game
    /// @param _id uint id of the game
    function _createGame(address payable _player1, address payable _player2, uint _bet, bytes32 _id) internal {
        games[_id] = Game(_player1, _player2, _bet, 0, 0, NULL, NULL, address(0), 0);
    }

    /// Creates a new player with the given name.
    /// Does NOT make sure that the player doesn't already exist.
    /// @param _player: address payable of the player
    /// @param _name: string name of the player to set
    function _registerPlayer(address payable _player, string calldata _name) internal {
        players[_player] = Player(true, _name, 0, 0);
    }

    /// Changes a player's name if they exist.
    /// @param _name: string name of the player
    function changePlayerName(string calldata _name) external {
        require(players[msg.sender].initialized, "Player does not exist");
        players[msg.sender].name = _name;
    }

    /// Processes a refund request. Refunds are only processed if the game is unfinished.
    /// In other words, it requires that the gameState is either 1 (waiting for player 2) or 2 (waiting for moves).
    /// @param _id: bytes32 id of the game
    function requestRefund(bytes32 _id) external {
        require(games[_id].gameState == 1 || games[_id].gameState == 2, "Game is not in a refundable state");
        require(games[_id].player1 == msg.sender || games[_id].player2 == msg.sender, "Player is not a player in this game");
        uint bet = games[_id].bet;
        emit gameCancel(_id);

        // Prevent re-entrancy attack
        games[_id].bet = 0;

        if (bet == 0) {
            return;
        }

        if (games[_id].gameState == 1) {
            // gameState 1 means only player 1 has sent a commit, so we only refund to them
            (bool sent,) = games[_id].player1.call{value: bet}("");
            require(sent, "Failed to send Ether");
        } else if (games[_id].gameState == 2) {
            // gameState 1 means both players have sent a commit, so we refund to both
            (bool sent,) = games[_id].player1.call{value: bet}("");
            (bool sent2,) = games[_id].player2.call{value: bet}("");
            require(sent && sent2, "Failed to send Ether");
        }

        // Set gameState to 3 to signal completion of game
        games[_id].gameState = 3;
    }

    /// Attempts to commit to the game with the given id. If the game doesn't exist, a new game is created with that id
    /// with msg.sender set as player 1. If it exists, msg.sender is set as player 2.
    /// In both cases, their respective commits are set and the bet ETH is transferred.
    ///
    /// The commit should be the Keccak256 digest of the salt + the player's choice (in that order).
    /// @param _id uint id of the game
    /// @param _commit bytes32 commit to the game (comprised of choice + salt)
    /// @param _playerName string of the player's username (modifies the existing name if it already exists)
    function sendCommitment(bytes32 _id, bytes32 _commit, string calldata _playerName) external payable {
        // Check if player already exists
        if (!players[msg.sender].initialized) {
            _registerPlayer(payable(msg.sender), _playerName);
        } else if (keccak256(abi.encodePacked(players[msg.sender].name)) != keccak256(abi.encodePacked(_playerName))) {
            players[msg.sender].name = _playerName;
        }

        require(games[_id].gameState <= 1, "The game has already started");
        if (games[_id].gameState == 0) {
            _createGame(payable(msg.sender), payable(0), msg.value, _id);
            games[_id].p1Commit = _commit;
            games[_id].gameState = 1;
        } else if (games[_id].gameState == 1) {
            require(games[_id].player1 != msg.sender, "This player has already committed to this game");
            if (games[_id].bet != msg.value) {
                emit betValue(_id, games[_id].bet);
            }
            require(games[_id].bet == msg.value, "Bet does not match what player 1 entered");
            games[_id].player2 = payable(msg.sender);
            games[_id].p2Commit = _commit;
            games[_id].gameState = 2;
            // Now get players to confirm their moves on the blockchain
            emit requestMoves(_id);
        }
    }

    /// Confirms a player's move by submitting both their choice and salt that were used in the initial commitment.
    /// When both players have confirmed their moves, the winner is determined.
    /// If the choice and/or salt do not match the one in the commitment, the function will revert.
    /// @param _id uint id of the game
    /// @param _choice uint choice of the player
    /// @param _salt bytes32 salt of the player
    function sendVerification(bytes32 _id, uint8 _choice, uint _salt) external {
        require(games[_id].gameState == 2, "Game is not ready to send moves");
        require(msg.sender == games[_id].player1 || msg.sender == games[_id].player2, "Only players can make moves");

        if (msg.sender == games[_id].player1) {
            require(games[_id].p1Choice == 0, "Player has already made the move");
            require(keccak256(abi.encodePacked(_salt, _choice)) == games[_id].p1Commit, "Commit does not match what player 1 entered");
            games[_id].p1Choice = _choice;
        } else {
            require(games[_id].p2Choice == 0, "Player has already made the move");
            require(keccak256(abi.encodePacked(_salt, _choice)) == games[_id].p2Commit, "Commit does not match what player 2 entered");
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
        require(games[_id].gameState == 2, "Game is not ready to determine winner");
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

        games[_id].gameState = 3;
        games[_id].winner = winnerAddr;
        uint bet = games[_id].bet;

        if (bet == 0) {
            return winnerAddr;
        }

        // Use call to send ether according to https://solidity-by-example.org/sending-ether/
        // Set the game bet to 0 to prevent re-entracy attacks
        games[_id].bet = 0;
        if (winnerAddr == payable(0)) {
            (bool sent,) = p1.call{value: bet}("");
            (bool sent2,) = p2.call{value: bet}("");
            require(sent && sent2, "Failed to send Ether");
        } else {
            (bool sent,) = winnerAddr.call{value: 2 * bet}("");
            require(sent, "Failed to send Ether");
            players[winnerAddr].wins++;
            players[loserAddr].losses++;
        }
        return winnerAddr;
    }
}