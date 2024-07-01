import { useContext, useEffect, useState } from "react";
import { appContext } from "../../../../../../AppContext";
import AnimatedDialog from "../../../../../UI/AnimatedDialog";
import DoubleArrowIcon from "../../../../../UI/Icons/DoubleArrow";
import { useTokenStoreContext } from "../../../../../../providers/TokenStoreProvider";
import { formatUnits } from "ethers";
import { useWalletContext } from "../../../../../../providers/WalletProvider/WalletProvider";
import Decimal from "decimal.js";

const AcceptOTC = () => {
  const { _promptAcceptOTC, promptAcceptOTC, handleActionViaBackend, notify } =
    useContext(appContext);
  const { _network } = useWalletContext();

  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const { tokens } = useTokenStoreContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (_promptAcceptOTC) {
        const requesttoken =
          _promptAcceptOTC.token.tokenName === "USDT"
            ? "Tether"
            : _promptAcceptOTC.token.tokenName;
        // check if user has enough to satisfy this deal
        const relevantToken = tokens.find((t) => t.name === requesttoken);

        const balance = formatUnits(
          relevantToken!.balance,
          _network === "sepolia" ? 18 : relevantToken!.decimals
        );

        // is our balance less than the requested amount
        if (new Decimal(balance).lt(_promptAcceptOTC.token.amount)) {
          setInsufficientFunds(true);
        } else {
          setInsufficientFunds(false);
        }
      }
    } catch (error) {
      console.error(error);
      setInsufficientFunds(true);
    }
  }, [_promptAcceptOTC]);

  const handleAccept = async () => {
    setLoading(true);

    _promptAcceptOTC.handleFocus(_promptAcceptOTC.index, 'hash');

    try {
      const message = {
        action: "ACCEPTOTCSWAP",
        coinid:
          _promptAcceptOTC && _promptAcceptOTC.coinid
            ? _promptAcceptOTC.coinid
            : null,
      };

      await handleActionViaBackend(message);

      notify("Accepted OTC deal!");
      promptAcceptOTC(null);
    } catch (error) {
      notify("Failed to collect OTC deal...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedDialog
      position="items-center h-screen w-full"
      extraClass=""
      isOpen={_promptAcceptOTC}
      onClose={() => (!loading ? promptAcceptOTC() : null)}
    >
      <div>
        <div className="flex justify-between items-center pr-4">
          <h3 className="font-bold ml-4">Accept OTC?</h3>
          <div />
        </div>

        <div className="px-4 py-2">
          {_promptAcceptOTC && (
            <p>
              You are giving{" "}
              <span className="font-mono tracking-wide">
                {_promptAcceptOTC.token.amount}
              </span>
              <span className="font-bold uppercase">
                {" " + _promptAcceptOTC.token.tokenName}
              </span>{" "}
              for
              <span className="font-mono tracking-wide">
                {" " + _promptAcceptOTC.native}
              </span>
              <span className="font-bold uppercase"> MINIMA</span>
            </p>
          )}
        </div>
        <div className="bg-transparent text-black dark:bg-black dark:text-white rounded-lg px-2">
          <div className="flex justify-center mx-3 my-3 items-center">
            <div />
            <div className="grid grid-rows-1 grid-cols-3 items-center">
              <div className="flex">
                <img
                  className="w-[34px] h-[34px] rounded-full inline-block pl-0.5 pb-0.5"
                  src={
                    _promptAcceptOTC &&
                    _promptAcceptOTC.token.tokenName === "wMinima"
                      ? "./assets/wtoken.svg"
                      : "./assets/tether.svg"
                  }
                />

                <p className="truncate text-sm my-auto font-mono font-bold ml-2">
                  {_promptAcceptOTC && _promptAcceptOTC.token
                    ? _promptAcceptOTC.token.amount
                    : "-"}
                </p>
              </div>

              <div className="flex justify-center">
                <DoubleArrowIcon
                  fill="fill-black dark:fill-teal-300"
                  size={22}
                />
              </div>

              <div className="flex items-center">
                <img
                  alt="token-icon"
                  src="./assets/token.svg"
                  className={`w-[34px] h-[34px] rounded-full`}
                />
                <p className="truncate text-sm my-auto font-mono font-bold ml-2">
                  {_promptAcceptOTC ? _promptAcceptOTC.native : "-"}
                </p>
              </div>
            </div>
            <div />
          </div>
        </div>

        <div className="grid-cols-2 mt-16 hidden md:grid">
          <div />
          <div className="grid grid-cols-2 gap-1 pr-4">
            <button disabled={loading} onClick={promptAcceptOTC}>
              Dismiss
            </button>
            <button
              disabled={insufficientFunds || loading}
              onClick={handleAccept}
              className="bg-black hover:bg-opacity-80 truncate dark:bg-teal-300 text-white dark:text-black font-bold disabled:bg-opacity-50"
            >
              {insufficientFunds && "Insufficient funds"}
              {!insufficientFunds && "Accept"}
            </button>
          </div>
        </div>

        <div className="grid-cols-1 mt-16 grid md:hidden">
          <div className="grid grid-cols-1 gap-2 px-4">
            <button
              disabled={insufficientFunds || loading}
              onClick={handleAccept}
              className="bg-black hover:bg-opacity-80 truncate dark:bg-teal-300 text-white dark:text-black font-bold disabled:bg-opacity-50"
            >
              {insufficientFunds && "Insufficient funds"}
              {!insufficientFunds && "Accept"}
            </button>
            <button disabled={loading} onClick={promptAcceptOTC}>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AcceptOTC;
