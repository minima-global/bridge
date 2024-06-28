import { useContext, useEffect, useState } from "react";
import { appContext } from "../../../AppContext";
import TokenList from "../../TokenList";
import NativeMinima from "../../NativeMinima";
import InfoTooltip from "../../UI/InfoTooltip";
import WalletIcon from "../../UI/Icons/WalletIcon";
import Decimal from "decimal.js";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";

import { differenceInSeconds } from "date-fns";

const Balance = () => {
  const { loaded, _currentNavigation, promptDeposit, promptWithdraw, _minimaBalance, getWalletBalance, setTriggerBalanceUpdate } = useContext(appContext);
  const {_balance: etherBalance, getEthereumBalance} = useWalletContext();
  
  const [runningLow, setRunningLow] = useState({minima: false, ethereum: false, disableEthereum: false});

  const callBalance = () => {
    setTriggerBalanceUpdate(true);
        setTimeout(() => {
          getEthereumBalance();
          setTriggerBalanceUpdate(false);
        }, 2000);
  }
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
          
          (window as any).MDS.keypair.set("_lastethbalancecheck", JSON.stringify({timestamp: now}), () => {})

          callBalance();
        }             
      } else {
        callBalance();
      }
    })
  }

  useEffect(() => {
    if (_currentNavigation === "balance") {
      if (_minimaBalance && new Decimal(_minimaBalance.confirmed).lt(1)) {
        setRunningLow(prevState => ({...prevState, minima: true}));
      } 
      
      if (etherBalance && new Decimal(etherBalance).lt(0.05)) {
        setRunningLow(prevState => ({...prevState, ethereum: true}));

        if (new Decimal(etherBalance).lt(0.01)) {
          setRunningLow(prevState => ({...prevState, disableEthereum: true}));
        }
      }
    
      // let's fetch Minima balance again..
      getWalletBalance();
      // Get Ethereum balance every 60s
      if (loaded && loaded.current) {
        handlePullBalance();
      }
    }
  }, [_currentNavigation, loaded]);

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
      {runningLow.ethereum && <div className="bg-yellow-600 dark:bg-yellow-300 text-white dark:text-black rounded-lg px-3 py-2 my-3">
        {!runningLow.disableEthereum&&<p className="text-xs font-bold">You are running low on Ethereum {"(< 0.05)"}, you should top up to fulfill orders</p>}        
        {!!runningLow.disableEthereum&&<p className="text-xs font-bold">You are low on funds and your order book has been disabled automatically</p>}        
        
      </div>}

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
