import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ABI_ERC20 from "../../abis/ERC20.json";
import { Contract, parseUnits } from "ethers";
import { appContext } from "../../AppContext";
import { GasFeeCalculated } from "../../types/GasFeeInterface";
import { TransactionResponse } from "ethers";
import { Asset } from "../../types/Asset";
import { useWalletContext } from "../WalletProvider/WalletProvider";

// mainnet Minima address 0x669c01CAF0eDcaD7c2b8Dc771474aD937A7CA4AF
// mainnet USDT address 0xdac17f958d2ee523a2206206994597c13d831ec7
// sepolia Minima address 0x2Bf712b19a52772bF54A545E4f108e9683fA4E2F (self deployed)
// sepolia USDT address 0xb3BEe194535aBF4E8e2C0f0eE54a3eF3b176703C (self deployed)

export const useTokenStoreContext = () => {
  const context = useContext(TokenStoreContext);

  if (!context)
    throw new Error(
      "useTokenStore must be called from within the TokenStoreProvider"
    );

  return context;
};

type Props = {
  children: React.ReactNode;
};
type Context = {
  tokens: Asset[];
  addToken: (token: Asset) => void;
  updateToken: (tokenAddress: string, newBalance: string) => void;
  fetchTokenBalance: (tokenAddress: string) => Promise<string>;
  getTokenByName: (tokenName: string) => Asset | null;
  transferToken: (
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    gas: GasFeeCalculated
  ) => Promise<TransactionResponse>;
  estimateGas: (
    tokenAddress: string,
    recipientAddress: string,
    amount: string
  ) => Promise<string>;
};

const TokenStoreContext = createContext<Context | null>(null);

export const TokenStoreContextProvider = ({ children }: Props) => {
  const [tokens, setTokens] = useState<Asset[]>([]);
  const { _provider, _defaultAssets, _triggerBalanceUpdate } = useContext(appContext);
  const { _wallet: signer, _address } = useWalletContext();

  const fetchTokenBalance = useCallback(
    async (tokenAddress: string) => {
      if (!signer) {
        throw new Error("Signer not available");
      }
      try {
        // Call balanceOf function
        const contract = new Contract(tokenAddress, ABI_ERC20, _provider);
        const balance = await contract.balanceOf(_address);
        return balance.toString();
      } catch (error) {
        // throw new Error(
        //   `Failed to fetch balance for token ${tokenAddress}: ${error.message}`
        // );
      }
    },
    [_provider, signer, _address]
  );

  useEffect(() => {
    setTokens([]);
    if (_defaultAssets && _defaultAssets.assets.length > 0) {
      (async () => {
        try {
          const calcBalance = await Promise.all(
            _defaultAssets.assets
              .filter((_a) => _a.type !== "ether")
              .map(async (asset) => {
                // Fetch the updated balance
                const updatedBalance = await fetchTokenBalance(asset.address);
                // Create a new object with the updated balance
                const updatedAsset = { ...asset, balance: updatedBalance };
                return updatedAsset;
              })
          );
          // Set the state with the new array of assets
          setTokens(calcBalance);        

        } catch (error) {
          // console.error("Error fetching token balances:", error);
          // Handle error, e.g., show error message to user or retry
        }
      })();
    }
  }, [_provider, _defaultAssets, fetchTokenBalance, _triggerBalanceUpdate]);

  const addToken = (token: Asset) => {
    setTokens((prevTokens) => [...prevTokens, token]);
  };

  const updateToken = (tokenAddress: string, newBalance: string) => {
    setTokens((prevTokens) =>
      prevTokens.map((token) =>
        token.address === tokenAddress
          ? { ...token, balance: newBalance }
          : token
      )
    );
  };

  const getTokenByName = (tokenName: string) => {
    return tokens.find((token) => token.name === tokenName) || null;
  };

  const estimateGas = async (
    tokenAddress: string,
    recipientAddress: string,
    amount: string
  ) => {
    try {
      const contract = new Contract(tokenAddress, ABI_ERC20, signer);
      const gasUnits = await contract.transfer.estimateGas(
        recipientAddress,
        parseUnits(amount, 18)
      );

      return gasUnits.toString();
    } catch (error) {
      console.error("Error estimating gas:", error);
      return "0"; // Default to 0 gasUnits
    }
  };

  const transferToken = async (
    tokenAddress: string,
    recipientAddress: string,
    amount: string,
    gas: GasFeeCalculated
  ) => {
    const _contract = new Contract(tokenAddress, ABI_ERC20, signer);

    const tx = await _contract.transfer(
      recipientAddress,
      parseUnits(amount, "ether"),
      {
        maxFeePerGas: parseUnits(gas.baseFee, "gwei"),
        maxPriorityFeePerGas: parseUnits(gas.priorityFee, "gwei"),
      }
    );

    return tx;
  };

  return (
    <TokenStoreContext.Provider
      value={{
        tokens,
        addToken,
        updateToken,
        getTokenByName,
        fetchTokenBalance,
        estimateGas,
        transferToken,
      }}
    >
      {children}
    </TokenStoreContext.Provider>
  );
};
