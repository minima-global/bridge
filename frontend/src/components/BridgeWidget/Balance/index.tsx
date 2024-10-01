import { useContext, useEffect, useState } from "react";
import { appContext } from "../../../AppContext";
import TokenList from "../../TokenList";
import InfoTooltip from "../../UI/InfoTooltip";
import WalletIcon from "../../UI/Icons/WalletIcon";
import Decimal from "decimal.js";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";

import { differenceInSeconds } from "date-fns";
import EthereumIcon from "../../UI/Icons/EthereumIcon";
import { ArrowDownIcon, ArrowLeft, ArrowUpIcon, Wallet2 } from "lucide-react";
import WithdrawingNative from "../../Withdraw/WithdrawingNative";
import NativeAddress from "../../Deposit/NativeAddress";
import NativeMinima from "../../NativeMinima";
import EthereumAddress from "../../Deposit/EthereumAddress";
import WithdrawingERC20 from "../../Withdraw/WithdrawingERC20";
import { Wallet } from "ethers";
import EthereumBalance from "../../Ethereum";

const Balance = () => {
  const { loaded, _currentNavigation, _minimaBalance, getWalletBalance } =
    useContext(appContext);
  const { _balance: etherBalance, callBalanceForApp } = useWalletContext();

  const [promptDepositNative, setPromptDepositNative] = useState(false);
  const [promptDepositEthereum, setPromptDepositEthereum] = useState(false);

  const [promptWithdrawNative, setPromptWithdrawNative] = useState(false);
  const [promptWithdrawEthereum, setPromptWithdrawEthereum] = useState(false);

  const [runningLow, setRunningLow] = useState({
    minima: false,
    ethereum: false,
    disableEthereum: false,
  });

  const handlePullBalance = () => {
    (window as any).MDS.keypair.get("_lastethbalancecheck", (resp) => {
      if (resp.status) {
        const dt = JSON.parse(resp.value);
        const now = new Date().getTime();

        // Convert dt.timestamp and now to Date objects
        const lastCheck = new Date(dt.timestamp);
        const currentTime = new Date(now);

        // Check if the difference is more than 60 seconds
        if (differenceInSeconds(currentTime, lastCheck) > 60) {
          (window as any).MDS.keypair.set(
            "_lastethbalancecheck",
            JSON.stringify({ timestamp: now }),
            () => {}
          );

          callBalanceForApp();
        }
      } else {
        callBalanceForApp();

        const now = new Date().getTime();

        (window as any).MDS.keypair.set(
          "_lastethbalancecheck",
          JSON.stringify({ timestamp: now }),
          () => {}
        );
      }
    });
  };

  useEffect(() => {
    if (_currentNavigation === "balance") {
      // let's fetch Minima balance again.. (since RPC is free.. just keep calling on every change)
      getWalletBalance();
      // Get Ethereum balance every 60s
      if (loaded && loaded.current) {
        handlePullBalance();
      }
    }
  }, [_currentNavigation, loaded]);

  useEffect(() => {
    if (_currentNavigation === "balance") {
      if (_minimaBalance && new Decimal(_minimaBalance.confirmed).lt(1)) {
        setRunningLow((prevState) => ({ ...prevState, minima: true }));
      }

      if (etherBalance && new Decimal(etherBalance).lt(0.01)) {
        setRunningLow((prevState) => ({ ...prevState, disableEthereum: true }));
      }

      if (etherBalance && new Decimal(etherBalance).lt(0.05)) {
        setRunningLow((prevState) => ({ ...prevState, ethereum: true }));
      }
    }
  }, [_currentNavigation, _minimaBalance, etherBalance]);

  const handleNativeDismiss = () => {
    setPromptDepositNative(false);
    setPromptWithdrawNative(false);
  };

  const handleEthereumDismiss = () => {
    setPromptDepositEthereum(false);
    setPromptWithdrawEthereum(false);
  };

  if (_currentNavigation !== "balance") {
    return null;
  }

  const showBackButtonNative = promptDepositNative || promptWithdrawNative;
  const showBackButtonEthereum =
    promptDepositEthereum || promptWithdrawEthereum;

  return (
    <div className="mx-4 md:mx-0 text-left">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-violet-100 dark:bg-violet-900 rounded-full">
            <Wallet2 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Swap Wallet Balance
          </h1>
        </div>

        <div className="relative h-1 w-32 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
      </div>

      <div className="bg-violet-100 border-l-4 border-violet-500 text-violet-700 p-4 mb-4 rounded">
        <p className="text-sm font-medium">
          All tokens deposited will be used to provide liquidity and fund swap
          contracts for seamless trading.
        </p>
      </div>

      <div className="grid gap-2">
        <div className="bg-white dark:bg-[#1b1b1b] text-card-foreground rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {showBackButtonNative && (
              <button
                type="button"
                onClick={handleNativeDismiss}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            )}
            <h2 className="text-xl font-semibold mb-4">
              {!showBackButtonNative && "Minima Balance"}
              {!promptDepositNative &&
                promptWithdrawNative &&
                "Withdraw From Swap Wallet"}
              {promptDepositNative &&
                !promptWithdrawNative &&
                "Deposit To Swap Wallet"}
            </h2>
          </div>
          {runningLow.minima && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4 rounded">
              <p className="text-sm font-medium">
                You are running low on Minima. Top up to fulfill orders.
              </p>
            </div>
          )}
          <div className="my-4">
            <NativeMinima />
          </div>

          {promptDepositNative && (
            <div className="my-8">
              <NativeAddress />
            </div>
          )}
          {promptWithdrawNative && (
            <div className="my-8">
              <WithdrawingNative />
            </div>
          )}

          {!promptDepositNative && !promptWithdrawNative && (
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setPromptDepositNative(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-500 text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <ArrowDownIcon className="w-4 h-4" />
                Deposit
              </button>
              <button
                onClick={() => setPromptWithdrawNative(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-md hover:bg-secondary/90 transition-colors"
              >
                <ArrowUpIcon className="w-4 h-4" />
                Withdraw
              </button>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#1b1b1b] text-card-foreground rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {showBackButtonEthereum && (
              <button
                type="button"
                onClick={handleEthereumDismiss}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
            )}
            <h2 className="text-xl font-semibold mb-4">
              {!showBackButtonEthereum && "Ethereum Balance"}
              {!promptDepositEthereum &&
                promptWithdrawEthereum &&
                "Withdraw From Swap Wallet"}
              {promptDepositEthereum &&
                !promptWithdrawEthereum &&
                "Deposit To Swap Wallet"}
            </h2>
          </div>
          {runningLow.ethereum && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4 rounded">
              <p className="text-sm font-medium">
                {runningLow.disableEthereum
                  ? "You are running on low on Ethereum (<0.01) and your order book has been disabled automatically.  Deposit some Ethereum to your wallet and re-activate your liquidity."
                  : "You are running low on Ethereum (< 0.05). Top up to fulfill orders."}
              </p>
            </div>
          )}
         
         <EthereumBalance />

          {!showBackButtonEthereum && <TokenList />}

          {promptDepositEthereum && (
            <div>
              <EthereumAddress />
            </div>
          )}
          {promptWithdrawEthereum && (
            <div className="my-8">
              <WithdrawingERC20 />
            </div>
          )}

          {!showBackButtonEthereum && (
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setPromptDepositEthereum(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-teal-500 text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <ArrowDownIcon className="w-4 h-4" />
                Deposit
              </button>
              <button
                onClick={() => setPromptWithdrawEthereum(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-md hover:bg-secondary/90 transition-colors"
              >
                <ArrowUpIcon className="w-4 h-4" />
                Withdraw
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Balance;
