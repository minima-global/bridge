import { Asset } from "../types/Asset";
import { Networks } from "../types/Network";

// This file stores web3 related constants such as addresses, token definitions, ETH currency references and ABI's

import { SUPPORTED_CHAINS, Token } from '@uniswap/sdk-core'

// Addresses

export const POOL_FACTORY_CONTRACT_ADDRESS =
  '0x1F98431c8aD98523631AE4a59f267346ea31F984'
export const QUOTER_CONTRACT_ADDRESS =
  '0x61fFE014bA17989E743c5F6cB21bF9697530B21e' // Quotev2

// Currencies and Tokens

export const USDT_TOKEN = new Token(
  SUPPORTED_CHAINS['1'],
  '0xdac17f958d2ee523a2206206994597c13d831ec7',
  6,
  'USDT',
  'USD//T'
)

export const WRAPPED_MINIMA_TOKEN = new Token(
  SUPPORTED_CHAINS['1'],
  '0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF',
  18,
  'WMINIMA',
  'Wrapped Minima'
)

const defaultAssetsStored: Asset[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    balance: "",
    address: "",
    decimals: 18,
    type: "ether"
  },
  {
    name: "wMinima",
    symbol: "WMINIMA",
    balance: "",
    address: "",
    decimals: 18,
    type: "erc20"
  },
  {
    name: "Tether",
    symbol: "USDT",
    balance: "",
    address: "",
    decimals: 6,
    type: "erc20"
  },
];

export const etherscan = {
  mainnet: {
    rpc: "https://etherscan.io/address/"
  },
  sepolia: {
    rpc: "https://sepolia.etherscan.io/address/"
  },
  goerli: {
    rpc: "https://goerli.etherscan.io/address/"
  }
}
export const networks: Networks = {
  mainnet: {
    name: "Ethereum",
    rpc: "https://mainnet.infura.io/v3/",
    chainId: "1",
    symbol: "ETH"
  },
  sepolia: {
    name: "SepoliaETH",
    rpc: "https://sepolia.infura.io/v3/",
    chainId: "11155111",
    symbol: "SepoliaETH"
  }
};
// default assets..
export const _defaults = {
  wMinima: {
    mainnet: "0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF",
    sepolia: "0x2Bf712b19a52772bF54A545E4f108e9683fA4E2F",
  },
  Tether: {
    mainnet: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    sepolia: "0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C",
  }
};

export default defaultAssetsStored;
