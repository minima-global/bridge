import { useContext, useState } from "react";
import { appContext } from "../../AppContext";
import NativeAddress from "./NativeAddress";
import EthereumAddress from "./EthereumAddress";
import AnimatedDialog from "../UI/AnimatedDialog";

const Deposit = () => {
  const { _promptDeposit, promptDeposit } = useContext(appContext);

  const [view, setView] = useState("native");

  if (_promptDeposit === null) {
    return null;
  }

  const isActive = (_current: string) => {
    return view === _current
      ? "bg-violet-500 rounded-lg text-white dark:text-black font-bold hover:text-white dark:hover:text-black py-2"
      : "text-violet-300 hover:text-violet-400 cursor-pointer my-auto opacity-50 duration-100";
  };

  return (
    <AnimatedDialog
      position="items-start my-16"
      isOpen={_promptDeposit}
      onClose={() => promptDeposit()}
      extraClass=""
    >
      <div className="max-h-[75vh] overflow-y-auto">
      
      <h2 className="text-center text-lg font-bold pb-1">Deposit</h2>
      <div className="px-3">
        <nav className="bg-violet-800 rounded-lg grid grid-cols-2 max-w-sm mx-auto text-center">
          <a
            onClick={() => setView("native")}
            className={`${isActive("native")}`}
          >
            Native
          </a>
          <a
            onClick={() => setView("erc20")}
            className={`${isActive("erc20")}`}
          >
            Ethereum
          </a>
        </nav>
      </div>
      {view === "native" && <NativeAddress />}
      {view === "erc20" && <EthereumAddress />}
      </div>
    </AnimatedDialog>
  );
};

export default Deposit;
