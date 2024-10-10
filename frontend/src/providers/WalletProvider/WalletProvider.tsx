import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { Wallet, parseUnits, formatEther, Signer } from "ethers";
import { appContext } from "../../AppContext";
import { GasFeeCalculated } from "../../types/GasFeeInterface";
import { TransactionResponse } from "ethers";
import { _defaults } from "../../constants";
import { getCurrentPoolPrice } from "../../libs/getPrice";

type Props = {
  children: React.ReactNode;
};
type Context = {
  _address: string | null;
  _network: string;
  _chainId: string | null;
  _poolPrice: number | null;
  _wallet: Signer | null;
  _balance: string;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  transfer: (
    address: string,
    amount: string,
    gas: GasFeeCalculated,
  ) => Promise<TransactionResponse>;
  getTokenType: (tokeName: string, currentNetwork: string) => string;
  getEthereumBalance: () => void;
  callBalanceForApp: () => void;
  setCurrentPoolPrice: Dispatch<SetStateAction<number | null>>;
};

const WalletContext = createContext<Context | null>(null);

export const WalletContextProvider = ({ children }: Props) => {
  const {
    _provider,
    _generatedKey,
    getWalletBalance,
    _triggerBalanceUpdate,
    setTriggerBalanceUpdate,
  } = useContext(appContext);
  const [_poolPrice, setCurrentPoolPrice] = useState<null | number>(null);
  const [_network, setNetwork] = useState("");
  const [_chainId, setChainId] = useState<string | null>(null);
  const [_wallet, setWallet] = useState<Signer | null>(null);
  const [_address, setAddress] = useState<string | null>(null);
  const [_balance, setBalance] = useState(""); // ether balance
  const [step, setStep] = useState(1);

  useMemo(async () => {
    if (!_generatedKey || _provider === null) return;

    const wallet = new Wallet(_generatedKey, _provider);
    const address = await wallet.getAddress();
    const network = await _provider.getNetwork();

    const balance = await _provider.getBalance(address);
    // get current pool price for wM vs usdt
    const poolPrice = await getCurrentPoolPrice(_provider);
    setCurrentPoolPrice(poolPrice);
    setBalance(formatEther(balance));
    setWallet(wallet);
    setNetwork(network.name);
    setAddress(address);
    setChainId(network.chainId);
  }, [_provider, _generatedKey]);

  const callBalanceForApp = async () => {
    // If there is already an on-going balance call.. stop

    if (_triggerBalanceUpdate) return;

    // Trigger balance update for ERC-20s...
    setTriggerBalanceUpdate(true);

    // Getting Ethereum Balance
    getEthereumBalance();

    // Get Swap Wallet Balance...
    await getWalletBalance();

    // Trigger Ethereum Balance update...
    setTimeout(() => {
      setTriggerBalanceUpdate(false);
    }, 2000);
  };

  /**
   *
   * @param address receiver address
   * @param amount amount (ether)
   * @param gas suggested gas fee
   * @returns the immediate response of this transaction
   */
  const transfer = async (
    address: string,
    amount: string,
    gas: GasFeeCalculated,
  ): Promise<TransactionResponse> => {
    const tx = await _wallet!
      .sendTransaction({
        to: address,
        value: parseUnits(amount, "ether"),
        maxPriorityFeePerGas: parseUnits(gas.priorityFee, "gwei"), // wei
        maxFeePerGas: parseUnits(gas.baseFee, "gwei"), // wei
      })
      .catch((err) => {
        throw err;
      });

    return tx;
  };

  const getTokenType = (token: string): string => {
    if (token === "ETH") {
      return "Ethereum";
    }

    if (token === "minima") {
      return "Minima";
    }

    const wMinimaMainnet = _defaults["wMinima"].mainnet.toUpperCase();
    const wMinimaSepolia = _defaults["wMinima"].sepolia.toUpperCase();
    const tetherMainnet = _defaults["Tether"].mainnet.toUpperCase();
    const tetherSepolia = _defaults["Tether"].sepolia.toUpperCase();

    if (token.startsWith("ETH:")) {
      const contractAddress = token.replace("ETH:", "").toUpperCase();

      if ([wMinimaMainnet, wMinimaSepolia].includes(contractAddress)) {
        return "wMinima";
      }

      if ([tetherMainnet, tetherSepolia].includes(contractAddress)) {
        return "Tether";
      }
    } else {
      if ([wMinimaMainnet, wMinimaSepolia].includes(token.toUpperCase())) {
        return "wMinima";
      }

      if ([tetherMainnet, tetherSepolia].includes(token.toUpperCase())) {
        return "Tether";
      }
    }

    return "Other";
  };

  const getEthereumBalance = async () => {
    if (!_address) return;
    try {
      const balance = await _provider.getBalance(_address);
      setBalance(formatEther(balance));
      
    } catch (error) {
      // err
      console.error(error);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        _poolPrice,
        _address,
        _network,
        _chainId,
        _wallet,
        _balance,
        transfer,
        step,
        setStep,

        getTokenType,
        getEthereumBalance,
        callBalanceForApp,
        setCurrentPoolPrice
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);

  if (!context)
    throw new Error(
      "WalletContext must be called from within the WalletContextProvider",
    );

  return context;
};
