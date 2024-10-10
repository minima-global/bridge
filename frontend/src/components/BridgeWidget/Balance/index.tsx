import { useContext, useEffect, useState, useRef } from "react";
import { appContext } from "../../../AppContext";
import TokenList from "../../TokenList";
import NativeMinima from "../../NativeMinima";
import InfoTooltip from "../../UI/InfoTooltip";
import WalletIcon from "../../UI/Icons/WalletIcon";
import Decimal from "decimal.js";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import { differenceInSeconds } from "date-fns";

export default function Balance() {
  const { 
    loaded, 
    _currentNavigation, 
    promptDeposit, 
    _promptDeposit, 
    _promptWithdraw, 
    promptWithdraw, 
    _minimaBalance, 
    getWalletBalance 
  } = useContext(appContext);
  
  const { _balance: etherBalance, callBalanceForApp } = useWalletContext();
  
  const [runningLow, setRunningLow] = useState({
    minima: false, 
    ethereum: false, 
    disableEthereum: false
  });

  const lastEthBalanceCheck = useRef(0);

  const handlePullBalance = () => {
    const now = new Date().getTime();
    if (differenceInSeconds(new Date(now), new Date(lastEthBalanceCheck.current)) > 60) {
      lastEthBalanceCheck.current = now;
      callBalanceForApp();
    }
  };

  useEffect(() => {
    if (_currentNavigation === "balance" && loaded && loaded.current) {
      // Call Ethereum balance once on page load
      handlePullBalance();

      // Set up interval to check balance every 60 seconds
      const intervalId = setInterval(handlePullBalance, 60000);

      // Clean up interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [_currentNavigation, loaded]);

  useEffect(() => {
    if (_currentNavigation === "balance") {
      if (_minimaBalance && new Decimal(_minimaBalance.confirmed).lt(1)) {
        setRunningLow(prevState => ({...prevState, minima: true}));
      } 
      
      if (etherBalance && new Decimal(etherBalance).lt(0.01)) {
        setRunningLow(prevState => ({...prevState, disableEthereum: true}));
      }
      
      if (etherBalance && new Decimal(etherBalance).lt(0.05)) {
        setRunningLow(prevState => ({...prevState, ethereum: true}));
      }
    }
  }, [_currentNavigation, _minimaBalance, etherBalance]);

  useEffect(() => {
    if (loaded && loaded.current) {
      getWalletBalance();
    }
  }, [_promptDeposit, _promptWithdraw, _currentNavigation, loaded]);

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
      {runningLow.minima && (
        <div className="bg-yellow-600 dark:bg-yellow-300 text-white dark:text-black rounded-lg px-3 py-2 my-3">
          <p className="text-xs font-bold">You are running low on Minima, you should top up to fulfill orders</p>
        </div>
      )}
      <div>
        <h3 className="font-bold mb-2">Native</h3>
        <NativeMinima display={false} />
      </div>
      <hr className="border border-violet-400 my-6" />
      {runningLow.ethereum && (
        <div className="bg-yellow-600 dark:bg-yellow-300 text-white dark:text-black rounded-lg px-3 py-2 my-3">
          {!runningLow.disableEthereum && (
            <p className="text-xs font-bold">You are running low on Ethereum {"(< 0.05)"}, you should top up to fulfill orders</p>
          )}
          {runningLow.disableEthereum && (
            <p className="text-xs font-bold">You are low on funds and your order book has been disabled automatically</p>
          )}
        </div>
      )}
      <TokenList />
      <div className="mx-auto max-w-sm my-8">        
        <div className="grid grid-cols-2 gap-2">
          <button onClick={promptDeposit} className="font-bold bg-teal-600 text-white dark:text-black">Deposit</button>
          <button onClick={promptWithdraw} className="font-bold bg-orange-600 text-white dark:text-black">Withdraw</button>
        </div>
      </div>
    </div>
  );
}