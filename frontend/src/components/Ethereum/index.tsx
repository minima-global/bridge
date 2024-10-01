import { useState, useEffect } from "react";
import EthereumIcon from "../UI/Icons/EthereumIcon";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";

const EthereumBalance = () => {
  const { _balance: etherBalance } = useWalletContext();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (etherBalance !== null) {
      setIsLoading(false);
    }
  }, [etherBalance]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full py-2 px-4 animate-pulse">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-24" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full py-2 px-4 md:max-w-max">
      <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full">
        <EthereumIcon fill="currentColor" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Ethereum
        </p>
        <p className="text-lg font-bold text-gray-900 dark:text-white">
          {etherBalance} <span className="text-sm font-normal">ETH</span>
        </p>
      </div>
    </div>
  );
};

export default EthereumBalance;
