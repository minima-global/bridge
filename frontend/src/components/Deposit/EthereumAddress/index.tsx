import { useContext, useRef, useState } from "react";
import { appContext } from "../../../AppContext";
import QRCode from "react-qr-code";
import WalletAddress from "../WalletAddress";
import ProgressIcon from "../../UI/Progress";
import PrivateKey from "../PrivateKey";

const EthereumAddress = () => {
  const { _userDetails } = useContext(appContext);

  const [viewKey, setViewKey] = useState(false);
  const [remainingTime, setRemainingTime] = useState(5000);
  const [held, setHeld] = useState(false);
  const timeoutRef: any = useRef(null);

  if (_userDetails === null) {
    return <ProgressIcon />;
  }

  const handleStart = () => {
    timeoutRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timeoutRef.current);
          setHeld(true);
          setViewKey(true);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
    setHeld(true);
  };

  const handleEnd = () => {
    setViewKey(false);
    clearInterval(timeoutRef.current);
    setRemainingTime(5000);
    setHeld(false);
  };

  return (
    <div className="max-w-sm mx-auto my-4 px-2">
      <div className="grid grid-cols-[1fr_auto_1fr]">
        <div />
        <div className="flex flex-col gap-3 items-center">
          <QRCode
            className="rounded-lg"
            size={200}
            value={_userDetails.ethaddress}
          />

          <div className="w-max mx-auto my-4">
            {!viewKey && (
              <WalletAddress _address={_userDetails.ethaddress} fullAddress />
            )}
            {!viewKey && (
              <button
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                className="mt-2 font-bold w-full rounded-lg text-white bg-purple-500"
              >
                {held
                  ? `Hold to reveal... (${Math.ceil(remainingTime / 1000)}s)`
                  : `View private key`}
              </button>
            )}
            {viewKey && (
              <div className="my-2">
                <PrivateKey fullAddress />
                <div
                  className="max-w-xs my-2 mx-auto bg-red-700 border border-red-800 text-red-100 px-4 py-3 rounded relative"
                  role="alert"
                >
                  <strong className="font-bold mr-1">Warning</strong>
                  <span className="block sm:inline">
                    Never share your private key with anyone! Doing so could
                    result in the loss of your funds.
                  </span>
                </div>
                <button
                  onClick={() => handleEnd()}
                  className="w-full bg-violet-500 text-white font-bold"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          <p className="text-sm max-w-[236px] text-center">
            Send Ethereum and ERC-20 tokens to this address <br /> (e.g
            wMINIMA/USDT)
          </p>
        </div>
        <div />
      </div>
    </div>
  );
};

export default EthereumAddress;
