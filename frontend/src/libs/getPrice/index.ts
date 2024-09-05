import { Contract } from "ethers";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";

export async function getCurrentPoolPrice(provider) {
  const poolContract = new Contract(
    "0x8e427a754b13fa1a165db583120daf7c3abe4019",
    IUniswapV3PoolABI.abi,
    provider,
  );
  const slot0 = await poolContract.slot0();
  return sqrtPriceX96ToPrice(slot0[0], 6, 18);
}

function sqrtPriceX96ToPrice(sqrtPriceX96, baseDecimals, quoteDecimals) {
  // Formula: (sqrtPriceX96^2) / (2^192)
  const sqrtPrice = parseInt(sqrtPriceX96) / 2 ** 96;
  const price = sqrtPrice ** 2 * 10 ** (quoteDecimals - baseDecimals);
  return price;
}
