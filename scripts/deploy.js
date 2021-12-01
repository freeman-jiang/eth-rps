const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  // const Greeter = await hre.ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");
  // await greeter.deployed();

  const RPS = await hre.ethers.getContractFactory("RPS");
  const rps = await RPS.deploy();
  await rps.deployed();

  // console.log("Greeter deployed to:", greeter.address);
  console.log("RPS deployed to:", rps.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
