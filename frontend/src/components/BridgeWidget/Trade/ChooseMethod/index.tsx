import { useContext } from "react";
import { appContext } from "../../../../AppContext";
import TradeIcon from "../../../UI/TradeIcon";
import OTCIcon from "../../../UI/OTCIcon";
import OrderBookIcon from "../../../UI/OrderBookIcon";

const ChooseMethod = () => {
  const { _currentNavigation, setCurrentTradeWindow } = useContext(appContext);

  return (
    <>
      <div className="my-4">
        <div className="flex justify-center items-center">
          <div className="flex gap-1 items-center">
            <TradeIcon />
            <h1 className="text-lg dark:text-white font-bold">Select Method</h1>
          </div>
        </div>
        <hr className="border border-gray-500 dark:border-teal-300 mb-6 mt-2 w-full mx-auto" />
      </div>
      <div className="flex justify-center flex-col h-full items-center">
        <div className="flex justify-center">
          <button type="button" onClick={() => setCurrentTradeWindow('orderbook')} className="hover:outline dark:hover:outline-yellow-300 text-center flex items-center justify-center flex-col gap-2 font-bold dark:bg-[#1B1B1B]">
            <OrderBookIcon /> Order Book
          </button>
        </div>

        <div className="flex items-center justify-center">
          <hr className="border border-violet-400 my-6 w-[120px] animate-pulse" />
          <span className="mx-4 text-sm text-black dark:text-yellow-300 font-semibold">
            Or
          </span>
          <hr className="border border-violet-400 my-6 w-[120px] animate-pulse" />
        </div>

        <div className="flex justify-center">
          <button type="button" onClick={() => setCurrentTradeWindow('otc')} className="hover:outline dark:hover:outline-yellow-300 text-center flex items-center justify-center flex-col gap-2 font-bold dark:bg-[#1B1B1B]">
            <OTCIcon /> OTC
          </button>
        </div>
      </div>
    </>
  );
};

export default ChooseMethod;
