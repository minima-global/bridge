import { useContext } from "react";
import { appContext } from "../../../AppContext";
import TokenList from "../../TokenList";
import NativeMinima from "../../NativeMinima";
import InfoTooltip from "../../UI/InfoTooltip";
import WalletIcon from "../../UI/WalletIcon";

const Balance = () => {
  const { _currentNavigation, promptDeposit } = useContext(appContext);

  if (_currentNavigation !== "balance") {
    return null;
  }

  return (
    <div className="mx-4 md:mx-0 text-left">
      <div className="my-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <WalletIcon />
            <h1 className="text-lg dark:text-white font-bold">Bridge Wallet</h1>
          </div>
          <InfoTooltip message="The Bridge wallet is separated from your main Native Minima and Ethereum Wallets." />
        </div>
      </div>
      <div></div>
      <div>
        <h3 className="font-bold mb-2">Native</h3>
        <NativeMinima />
      </div>
      <hr className="border-2 border-violet-400 my-6"></hr>
      <TokenList />

      <div className="mx-auto max-w-sm my-8">        
        <div className="grid grid-cols-2 gap-2">
          <button onClick={promptDeposit} className="font-bold bg-teal-800 text-white dark:text-black">Deposit</button>
          <button className="font-bold bg-violet-800 text-white dark:text-black">Withdraw</button>
        </div>
      </div>
    </div>
  );
};

export default Balance;
