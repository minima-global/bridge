import { useContext, useState } from "react";
import { appContext } from "../../../../../../AppContext";
import AnimatedDialog from "../../../../../UI/AnimatedDialog";
import DoubleArrowIcon from "../../../../../UI/Icons/DoubleArrow";

const AcceptOTC = () => {
  const { _promptAcceptOTC, promptAcceptOTC, handleActionViaBackend, notify } =
    useContext(appContext);

  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);

    console.log(_promptAcceptOTC);
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
      onClose={() => !loading ? promptAcceptOTC() : null}
    >
      <div>
        <div className="flex justify-between items-center pr-4">
          <h3 className="font-bold ml-4">Accept OTC?</h3>
          <div />
        </div>
        <div className="my-2">
          <p className="px-4">
            Swapping Native Minima to{" "}
            {_promptAcceptOTC && _promptAcceptOTC.token
              ? _promptAcceptOTC.token.tokenName
              : "-"}
          </p>
        </div>
        <div className="grid grid-cols-[1fr_minmax(0,_260px)_1fr] my-6">
          <div />
          <div className="grid grid-cols-[1fr_1fr_1fr]">
            <div className="bg-gradient-to-r from-teal-600 to-white dark:from-teal-600 dark:to-white rounded-full w-max">
              <img
                alt="token-icon"
                src="./assets/token.svg"
                className="w-[36px] h-[36px] rounded-full inline-block pl-0.5 pb-0.5"
              />
              <p className="max-w-xs text-black font-black inline-block my-auto font-mono text-sm px-2">
                {_promptAcceptOTC ? _promptAcceptOTC.native : "-"}
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-black my-auto rounded animate-pulse flex justify-center">
              <DoubleArrowIcon />
            </div>
            <div className="my-auto mx-auto">
              <div className="bg-gradient-to-r from-white to-teal-600 dark:from-teal-600 dark:to-white rounded-full w-max">
                <p className="max-w-xs text-black font-bold inline-block my-auto font-mono text-sm px-2">
                  {_promptAcceptOTC && _promptAcceptOTC.token
                    ? _promptAcceptOTC.token.amount
                    : "-"}
                </p>
                <img
                  className="w-[36px] h-[36px] rounded-full inline-block pl-0.5 pb-0.5"
                  src={
                    _promptAcceptOTC &&
                    _promptAcceptOTC.token.tokenName === "wMinima"
                      ? "./assets/wtoken.svg"
                      : "./assets/tether.svg"
                  }
                />
              </div>
            </div>
          </div>
          <div />
        </div>

        <div className="grid grid-cols-2 mt-16">
          <div />
          <div className="grid grid-cols-2 gap-1 pr-4">
            <button disabled={loading} onClick={promptAcceptOTC}>
              Dismiss
            </button>
            <button
              disabled={loading}
              onClick={handleAccept}
              className="bg-black hover:bg-opacity-80 dark:bg-teal-300 text-white dark:text-black font-bold disabled:bg-opacity-50"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </AnimatedDialog>
  );
};

export default AcceptOTC;
