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

type Props = {
  children: React.ReactNode;
};
type Context = {
  _address: string | null;
  _network: string;
  _chainId: string | null;
  _wallet: Signer | null;
  _balance: string;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  transfer: (
    address: string,
    amount: string,
    gas: GasFeeCalculated
  ) => Promise<TransactionResponse>;
  getTokenType: (tokeName: string, currentNetwork: string) => string;
};

const WalletContext = createContext<Context | null>(null);

export const WalletContextProvider = ({ children }: Props) => {
  const { _provider, _generatedKey } = useContext(appContext);
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
    setBalance(formatEther(balance));
    setWallet(wallet);
    setNetwork(network.name);
    setAddress(address);
    setChainId(network.chainId);
  }, [_provider, _generatedKey]);

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
    gas: GasFeeCalculated
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
      if (token.startsWith("ETH:")) {
          const contractAddress = token.replace("ETH:", "").toUpperCase();
          
          const wMinimaMainnet = _defaults['wMinima'].mainnet.toUpperCase();
          const wMinimaSepolia = _defaults['wMinima'].sepolia.toUpperCase();
          const tetherMainnet = _defaults['Tether'].mainnet.toUpperCase();
          const tetherSepolia = _defaults['Tether'].sepolia.toUpperCase();

          if ([wMinimaMainnet, wMinimaSepolia].includes(contractAddress)) {
            return 'wMinima';
          }
          
          if ([tetherMainnet, tetherSepolia].includes(contractAddress)) {
            return 'Tether';
          }
      }

      if (token === 'minima') {
        return 'Minima';
      }
  
      return "Other";
  };

  return (
    <WalletContext.Provider
      value={{
        _address,
        _network,
        _chainId,
        _wallet,
        _balance,
        transfer,
        step,
        setStep,

        getTokenType,
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
      "WalletContext must be called from within the WalletContextProvider"
    );

  return context;
};
