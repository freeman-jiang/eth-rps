# EthRPS

A simple, decentralized rock paper scissors game that runs on the Ethereum blockchain. The application is currently hosted on Vercel [here](https://eth-rps.vercel.app/) and the contract is deployed to the Ropsten test network.

## Screenshots

<img width="1512" alt="landing" src="https://user-images.githubusercontent.com/56516912/144764641-45cba57c-8d9e-4fdc-a445-a9087a28e5c9.png">
<img width="1512" alt="commitment received" src="https://user-images.githubusercontent.com/56516912/144764649-fb159ac2-d9c7-4ae4-84a9-5e88cbaffeeb.png">
<img width="1512" alt="search" src="https://user-images.githubusercontent.com/56516912/144764653-37e12e10-fd39-4c57-a670-a2597b54eb40.png">



## The Application

The frontend for EthRPS is built using React, NextJS, and Chakra UI. It communicates with the contract using Ethers.js and features a responsive design with adjustable light and dark modes. While in game, players use a control panel to access their username, game ID, status of pending transactions, bet amount, and choice. Users can also search the blockchain to see information about existing games or stats about particular players. 

The application listens for events and informs users with toasts (pop-ups) of any updates or errors given by the contract. One of the peculiarities of interacting with Solidity contracts is that values are often given as `BigInt` values in Wei, which needed to be converted to Ether.

## The Contract

The naive implementation of a rock paper scissors game would have each player submit their choice individually,
and once both players have chosen, the game would be checked for a winner. However, since all blockchain transactions are public,
the player who goes second would be able to see the first player's choice and thus have an unfair advantage.

Hence, we have three goals that we want to achieve with this RPS implementation:

1. Two players can play rock paper scissors against each other.
2. No player can see what the other player has chosen until both have chosen their move.
   1. In other words, the second player cannot see what the first player has chosen.
3. Any user can check details about the game.

To accomplish the second goal, we securely generate a nonce that is stored client-side.
Then, the player's choice is hashed with the nonce and then sent to the blockchain. We call this hashed choice a "commit".
Although the commit is publicly available, the nonce is private to the player so no third party can determine the original choice.

Once both players have committed, a `requestMoves` event is emitted by the contract which tells players to verify their commits.
Now, both players must submit their choice and the nonce to the contract, which will then be hashed and compared to the commit.
If the hashes match, the choice has been verified. Otherwise, the contract will reject the verification.

Upon both players verifying, the game automatically checks for a winner and emits a `winner` event to signify the completion of the game.

Thus, every game can be split into five steps:

1. Uninitialized (`gameState = 0`)
2. First player has joined and submitted a commit (`gameState = 1`)
3. Second player has joined and submitted a commit (`gameState = 2`)
4. Both players individually verify their choices (`gameState = 2`)
5. Winner is processed and game complete (`gameState = 3`)

We store information about the game in a `Game` struct, which contains the following fields:

- addresses of each player (`player1` and `player2`)
- string usernames of each player (`player1Name` and `player2Name`)
- commits of each player (`p1Commit` and `p2Commit`)
- bet amount (`bet`, see next section)
- verified choice of each player (`p1Choice` and `p2Choice`)
- winner's address (`winner`)
- the game's state (`gameState`)

Some of these fields are initially zero, but will be populated as the game progresses.
The `Game`s are mapped to a unique game ID, which is an arbitrary `bytes32` hash generated client-side. Anybody can query a game by its ID through the
`getGameDetails()` function in the contract.

### Betting

The contract allows players to place a bet on the outcome of the game. The amount to bet is determined by the `msg.value` field of the first player who commits.
Then, the second player must bet the exact same amount on their commit. The winning player will earn the total sum of the two bets, and the losing player will lose their bet.
On a tie, the bets are refunded.

We have a `requestRefund()` function that allows players to request a refund at any point as long as the game is not completed.
This will transfer the bets back to the players and set the game state to `4` to signify cancellation.
Note that depending on the progress of the game, the second player may not have joined yet and in that case, the function will only
refund the first player.

#### Security and re-entrancy protection

Because the transfer of funds back to the players requires an external call, it is prone to re-entrancy attacks.
The two functions that transfer funds are `_determineWinner()`—which is called once both players have verified their choice—and `requestRefund()`, which is called when either player requests a refund.

To prevent these attacks, we implement the check-effects-interaction pattern for each of these functions.
At the beginning of the function, we have a guard check that requires the game to be in a state that allows the funds to be transferred.
In this case, `_determineWinner()` requires that `gameState == 2` (both players have submitted their choice) and `requestRefund()` requires that `gameState == 1 || gameState == 2` (game is in progress).
Immediately after, the `gameState` is updated accordingly to either `3` (game complete) or `4` (game cancelled).
The transfer of funds is the final step in the function, and at this point, the game is no longer in a state that allows the funds to be transferred
so an attempt at re-entrancy will fail.

### Searching the blockchain

Users have the ability to search for players and games that have been played through this contract. Player data is stored in the `Player` struct which is mapped to an individual Ethereum address, and contains the following fields
- number of games won (`wins`)
- number of games lost (`losses`)
- total money earned (`winnings`)

These statistics are updated at the end of every game and can be queried through the `getPlayerDetails()` function.

Similarly, since the game structs are mapped by their ID, we also have `getGameDetails()` that returns information from that game. When these functions are queried from the frontend, we can display these statistics on the webpage.

#### Examples

Search the blockchain using these example addresses and game IDs:

**Addresses:**
- 0xcCff1F526532FE12269d9c6A53189dA8A44CBC25
- 0xB16D7Bf48a199109C47bB2821850FED787DF96A2

**Game IDs:**
- L0rrHBNUcpti33TdzvrCl
- M6MXB8M-aGBHU-o98aPIu


## Potential improvements

The biggest issue that we noticed since deploying to the Ropsten test network was that transactions on the blockchain would take a long time to confirm on layer 1 (from 5-30 seconds). Since Ropsten is most similar to the Ethereum mainnet, this suggests that our application would also be very slow there. A potential solution would be to deploy our contract on a [layer 2](https://ethereum.org/en/developers/docs/scaling/layer-2-rollups/) network, which would drastically decrease transaction time.

Since our game requires that both players have the same bet, we wanted to implement a way for the second player to know what the first player's bet was.
Currently, the second player's commit is simply rejected by the require guard if the bets do not match.
We attempted to use EVM events to notify the second player of the first player's bet, but this requires the unnecessary overhead of a transaction (i.e. a gas cost).
We are still investigating an alternate solution to this problem.

Another improvement would be to implement a matchmaking system so players can be matched with other players who are waiting to play.
One potential implementation of this would be to have an array of game IDs that only have one player. If a player is searching for a match,
they can query the array for a game to join, or if the array is empty, create a new game and add it to the array. Once a game has two players or is cancelled,
the game ID can be removed from the array.

For the frontend, the code could be further refactored into more reusable components as there is a decent amount of repeated code. Moreover, the event checking system could be improved by using a filter in Ethers.js instead of the current manual check.
