import { useContext } from "react";
import { appContext } from "../../../../AppContext";
import SwapIcon from "../../../UI/Icons/SwapIcon";
import useAllowanceChecker from "../../../../hooks/useAllowanceChecker";
import OrderBookForm from "./OrderBookForm";
// import CompleteOrderBook from "./CompleteOrderBook/index.js";

const OrderBookTrading = () => {
  const { _currentTradeWindow } = useContext(appContext);

  useAllowanceChecker();

  if (_currentTradeWindow !== "orderbook") {
    return null;
  }

  return (
    <div className="mx-4 md:mx-0 text-left">
      <div className="my-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 items-center">
            <SwapIcon />
            <h1 className="text-lg dark:text-white font-bold">
              Order Book
            </h1>
          </div>
        </div>
        <hr className="border border-gray-500 dark:border-teal-300 mb-1 mt-2 w-full mx-auto" />

        <div className="mt-4"></div>
      </div>
      <div className="grid">
        <OrderBookForm />

        {/* <div className="flex items-center justify-center">
          <hr className="border border-violet-400 my-6 w-[90px] md:w-[120px]" />
          <span className="mx-4 text-sm text-center text-black dark:text-white font-bold">
            Order Book
          </span>
          <hr className="border border-violet-400 my-6 w-[90px] md:w-[120px]" />
        </div> */}

        {/* <CompleteOrderBook /> */}
      </div>
    </div>
  );
};

export default OrderBookTrading;
