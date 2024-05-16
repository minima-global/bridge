import { useContext, useEffect, useState } from "react";
import { appContext } from "../../../AppContext";
import TokenList from "../../TokenList";
import NativeMinima from "../../NativeMinima";
import InfoTooltip from "../../UI/InfoTooltip";
import WalletIcon from "../../UI/Icons/WalletIcon";
import Decimal from "decimal.js";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";

const Balance = () => {
  const { _currentNavigation, promptDeposit, promptWithdraw, _minimaBalance } = useContext(appContext);
  const {_balance: etherBalance} = useWalletContext();
  const [runningLow, setRunningLow] = useState({minima: false, ethereum: false});

  useEffect(() => {
    if (_currentNavigation === "balance") {
      if (_minimaBalance && new Decimal(_minimaBalance.confirmed).lt(1)) {
        setRunningLow(prevState => ({...prevState, minima: true}));
      } 
      
      if (etherBalance && new Decimal(etherBalance).lt(1)) {
        setRunningLow(prevState => ({...prevState, ethereum: true}));
      }
    }
  }, [_currentNavigation]);

  if (_currentNavigation !== "balance") {
    return null;
  }

  return (
    <div className="mx-4 md:mx-0 text-left">
      <div className="my-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 items-center">
            <WalletIcon />
            <h1 className="text-lg dark:text-white font-bold">Swap Wallet</h1>
          </div>
          <InfoTooltip message="The Swap wallet is separated from your main Native Minima and Ethereum Wallets." />
        </div>
        <hr className="border border-gray-500 dark:border-teal-300 mt-2 w-full mx-auto" />
      </div>
      <div>
        {runningLow.minima && <div className="bg-yellow-600 dark:bg-yellow-300 text-white dark:text-black rounded-lg px-3 py-2 my-3"><p className="text-xs font-bold">You are running low on Minima, you should top up to fulfill orders</p></div>}
      </div>
      <div>
        <h3 className="font-bold mb-2">Native</h3>
        <NativeMinima display={false} />
      </div>
      <hr className="border border-violet-400 my-6"></hr>
      {runningLow.ethereum && <div className="bg-yellow-600 dark:bg-yellow-300 text-white dark:text-black rounded-lg px-3 py-2 my-3"><p className="text-xs font-bold">You are running low on Ethereum, you should top up to fulfill orders</p></div>}

      <TokenList />

      <div className="mx-auto max-w-sm my-8">        
        <div className="grid grid-cols-2 gap-2">
          <button onClick={promptDeposit} className="font-bold bg-teal-600 text-white dark:text-black">Deposit</button>
          <button onClick={promptWithdraw} className="font-bold bg-orange-600 text-white dark:text-black">Withdraw</button>
        </div>
      </div>
    </div>
  );
};

export default Balance;
