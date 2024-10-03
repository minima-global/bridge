import { useContext } from "react";
import { appContext } from "../../../../AppContext";
import useAllowanceChecker from "../../../../hooks/useAllowanceChecker";
import OrderBookForm from "./OrderBookForm";
import OrderHistory from "./OrderHistory";
import CompleteOrderBook from "./CompleteOrderBook";
import {
  ArrowLeft,
  Users,
  PlusCircle,
  AlertTriangle,
} from "lucide-react";

const OrderBookTrading = () => {
  const {
    _currentTradeWindow,
    setCurrentTradeWindow,
    setCurrentNavigation,
    _allowanceLock,
    setPromptAllowance,
  } = useContext(appContext);

  useAllowanceChecker();

  if (_currentTradeWindow !== "orderbook") {
    return null;
  }

  const handleAddLiquidity = () => {
    setCurrentNavigation("liquidity");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentTradeWindow(null)}
              className="p-2 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Order Book
            </h1>
          </div>
          <button
            onClick={handleAddLiquidity}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 shadow-md hover:shadow-lg"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-semibold">Add Liquidity</span>
          </button>
        </div>
        <div className="relative h-1 w-48 bg-violet-600 dark:bg-violet-400 rounded-full"></div>
      </div>

      {_allowanceLock && (
        <div
          className="mb-8 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg shadow-md"
          role="alert"
        >
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2 flex-shrink-0" />
            <p className="font-bold">Token Allowance Required</p>
          </div>
          <p className="mt-2">
            To start trading, please allow allowance on your tokens. This is a
            one-time action.
          </p>
          <button
            className="mt-4 w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
            onClick={() => setPromptAllowance(true)}
          >
            Approve Allowance
          </button>
        </div>
      )}

      <div className="space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <OrderBookForm />
        </section>

        <OrderHistory />

        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-violet-600 dark:text-violet-400" />
            Liquidity Providers
          </h2>
          <CompleteOrderBook />
        </section>
      </div>
    </div>
  );
};

export default OrderBookTrading;