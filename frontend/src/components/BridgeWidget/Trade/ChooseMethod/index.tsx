import { useContext } from "react";
import { appContext } from "../../../../AppContext";
import TradeIcon from "../../../UI/Icons/TradeIcon";
import OTCIcon from "../../../UI/Icons/OTCIcon";
import OrderBookIcon from "../../../UI/Icons/OrderBookIcon";
import useAllowanceChecker from "../../../../hooks/useAllowanceChecker";

const ChooseMethod = () => {
  const { setCurrentTradeWindow } = useContext(appContext);

  useAllowanceChecker();

  return (
    <>
      <div className="my-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 items-center">
            <TradeIcon />
            <h1 className="text-lg dark:text-white font-bold">Select Method</h1>
          </div>
        </div>
        <hr className="border border-gray-500 dark:border-teal-300 mb-6 mt-2 w-full mx-auto" />
      </div>
      <div className="grid md:grid-cols-[1fr_auto_1fr] md:divide-x divide-violet-300">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setCurrentTradeWindow("orderbook")}
            className="hover:outline dark:hover:outline-yellow-300 text-center flex items-center justify-center flex-col gap-2 font-bold dark:bg-[#1B1B1B]"
          >
            <OrderBookIcon /> Order Book
          </button>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <hr className="border border-violet-400 h-6 w-1 absolute left-0 top-0 animate-pulse block md:hidden" />
          <span className="mx-4 text-sm text-black dark:text-yellow-300 font-semibold block md:hidden">
            Or
          </span>
          <hr className="border border-violet-400 h-6 w-1 absolute left-0 bottom-0 animate-pulse block md:hidden" />
        </div>

        <div className="flex md:hidden items-center justify-center">
          <hr className="border border-violet-400 my-6 w-[120px] animate-pulse" />
          <span className="mx-4 text-sm text-black dark:text-yellow-300 font-semibold">
            Or
          </span>
          <hr className="border border-violet-400 my-6 w-[120px] animate-pulse" />
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setCurrentTradeWindow("otc")}
            className="hover:outline dark:hover:outline-yellow-300 text-center flex items-center justify-center flex-col gap-2 font-bold dark:bg-[#1B1B1B]"
          >
            <OTCIcon /> OTC
          </button>
        </div>
      </div>
    </>
  );
};

export default ChooseMethod;
