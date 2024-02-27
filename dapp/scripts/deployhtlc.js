async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying HTLC contract with the account:", deployer.address);

  const token = await ethers.deployContract("HTLC");

  console.log("HTLC contract address:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });