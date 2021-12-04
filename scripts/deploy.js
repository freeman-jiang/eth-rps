const hre = require("hardhat");

async function main() {
  const RPS = await hre.ethers.getContractFactory("RPS");
  const rps = await RPS.deploy();
  await rps.deployed();
  console.log("RPS deployed to:", rps.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
