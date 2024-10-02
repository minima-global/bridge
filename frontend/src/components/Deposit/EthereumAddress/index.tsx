import { useContext, useRef, useState } from "react";
import { appContext } from "../../../AppContext";
import QRCode from "react-qr-code";
import WalletAddress from "../WalletAddress";
import ProgressIcon from "../../UI/Progress";
import PrivateKey from "../PrivateKey";
import { Eye, EyeOff, AlertTriangle } from "lucide-react";

const EthereumAddress = () => {
  const { _userDetails } = useContext(appContext);

  const [viewKey, setViewKey] = useState(false);
  const [remainingTime, setRemainingTime] = useState(5000);
  const [held, setHeld] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (_userDetails === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <ProgressIcon />
      </div>
    );
  }

  const handleStart = () => {
    timeoutRef.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 0) {
          if (timeoutRef.current) {
            clearInterval(timeoutRef.current); // Stop the interval after 3 calls
            timeoutRef.current = null; // Reset the intervalRef to null
          }
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
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current); // Stop the interval after 3 calls
      timeoutRef.current = null; // Reset the intervalRef to null
    }
    setRemainingTime(5000);
    setHeld(false);
  };

  return (
    <div className="max-w-sm mx-auto my-8 px-4">
      <div className="bg-violet-50 dark:bg-gray-800 rounded-lg p-6">
        <div className="flex flex-col items-center gap-6">
          <QRCode
            className="rounded-lg"
            size={200}
            value={_userDetails.ethaddress}
          />

          <div className="w-full">
            {!viewKey && (
              <div className="flex justify-center">
                <WalletAddress _address={_userDetails.ethaddress} fullAddress />
              </div>
            )}
            {!viewKey ? (
              <button
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                className="mt-4 font-bold w-full py-3 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {held ? (
                  <>
                    <Eye className="w-5 h-5" />
                    Hold to reveal... ({Math.ceil(remainingTime / 1000)}s)
                  </>
                ) : (
                  <>
                    <EyeOff className="w-5 h-5" />
                    View private key
                  </>
                )}
              </button>
            ) : (
              <div className="mt-4 space-y-4">
                <PrivateKey fullAddress />
                <div
                  className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
                  role="alert"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <strong className="font-bold">Warning:</strong>
                  </div>
                  <p className="text-sm mt-2">
                    Never share your private key with anyone! Doing so could
                    result in the loss of your funds.
                  </p>
                </div>
                <button
                  onClick={handleEnd}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors duration-200"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          <p className="text-sm text-center text-violet-600 dark:text-gray-300">
            Send Ethereum and ERC-20 tokens to this address
            <br />
            (e.g wMINIMA/USDT)
          </p>
        </div>
      </div>
    </div>
  );
};

export default EthereumAddress;
