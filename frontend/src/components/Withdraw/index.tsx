import { useContext, useState } from "react";
import { appContext } from "../../AppContext";
import AnimatedDialog from "../UI/AnimatedDialog";
import WithdrawingNative from "./WithdrawingNative";
import WithdrawingERC20 from "./WithdrawingERC20";

const Withdraw = () => {
  const { _promptWithdraw, promptWithdraw } = useContext(appContext);

  const [view, setView] = useState("native");

  if (_promptWithdraw === null) {
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
      isOpen={_promptWithdraw}
      onClose={() => promptWithdraw()}
      extraClass=""
    >
      <h2 className="text-center text-lg font-bold pb-1">Withdraw</h2>
      <div className="px-3">
        <nav className="bg-violet-800 rounded-lg grid grid-cols-2 max-w-sm mx-auto text-center px-2">
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

      {view === "native" && <WithdrawingNative />}
      {view === "erc20" && <WithdrawingERC20 />}
    </AnimatedDialog>
  );
};

export default Withdraw;
