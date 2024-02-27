async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying wMinima contract with the account:", deployer.address);

  const token = await ethers.deployContract("WMINIMA");

  console.log("wMinima address:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });