import { useContext } from "react";
import { appContext } from "../../../AppContext";
import { ArrowLeft, Droplets } from "lucide-react";
import YourPools from "./YourPools/index.js";

const Liquidity = () => {
  const { _currentNavigation, setCurrentNavigation } = useContext(appContext);

  if (_currentNavigation !== "liquidity") {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setCurrentNavigation("trade")}
            className="p-2 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Add Liquidity
          </h1>
        </div>
        <div className="relative h-1 w-32 bg-violet-600 dark:bg-violet-400 rounded-full"></div>
      </div>

      <div className="p-0">
        <div className="bg-violet-100 border-l-4 border-violet-500 text-violet-700 p-4 mb-4 rounded">
          <p className="text-sm font-medium leading-relaxed text-left">
            You can choose to provide liquidity to the orderbook for other users
            to trade with. All{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              native Minima
            </span>{" "}
            and{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              WMINIMA
            </span>{" "}
            (or{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              USDT
            </span>
            ) in your Swap wallet will be made available for other users. You
            will make a margin based on your buy/sell prices. Trades will only
            execute at your chosen buy/sell prices.
          </p>
        </div>

        <YourPools />
      </div>
    </div>
  );
};

export default Liquidity;
