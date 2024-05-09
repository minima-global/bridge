import { Token } from "@uniswap/sdk-core";
import {
  Contract,
  MaxUint256,
  Signer,
  TransactionReceipt,
  parseUnits,
} from "ethers";

import ERC20_ABI from "../abis/ERC20.json";

import { HTLCContractAddress } from "../../../dapp/js/htlcvars.js";

export async function getTokenTransferApproval(
  token: Token,
  amount: string,
  signer: Signer,
  address: string
): Promise<TransactionReceipt> {
  if (!signer || !address) {
    throw Error("No Provider Found");
  }

  const tokenContract = new Contract(token.address, ERC20_ABI, signer);

  let toWei = parseUnits(amount, token.decimals);
  if (amount === MaxUint256.toString()) {
    toWei = MaxUint256;
  }
  const transaction = await tokenContract.approve(HTLCContractAddress, toWei);

  return transaction.wait();
}

export async function resetApproval(
  token: Token,
  signer: Signer,
  address: string
): Promise<TransactionReceipt> {
  if (!signer || !address) {
    throw Error("No Provider Found");
  }

  const tokenContract = new Contract(token.address, ERC20_ABI, signer);

  const transaction = await tokenContract.approve(HTLCContractAddress, 0);

  return transaction.wait();
}

export async function estimateGasForApproval(
  token: Token,
  amount: string,
  signer: Signer,
  address: string
): Promise<string> {
  if (!signer || !address) {
    throw Error("No Provider Found");
  }

  const tokenContract = new Contract(token.address, ERC20_ABI, signer);

  const gasEstimation = await tokenContract.approve.estimateGas(
    HTLCContractAddress,
    amount
  );

  return gasEstimation.toString();
}
