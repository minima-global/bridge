import { useContext } from "react";
import { appContext } from "../../../../AppContext";
import { Book, Users, ArrowRightLeft } from "lucide-react";
import useAllowanceChecker from "../../../../hooks/useAllowanceChecker";

const ChooseMethod = () => {
  const { setCurrentTradeWindow } = useContext(appContext);

  useAllowanceChecker();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-violet-100 dark:bg-violet-900 rounded-full">
            <ArrowRightLeft className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Select Trading Method
          </h1>
        </div>

        <div className="relative h-1 w-32 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <TradeOption
          icon={
            <Book className="w-12 h-12 mb-4 text-purple-600 dark:text-purple-400" />
          }
          title="Order Book"
          description="Trade with other users who are providing liquidity"
          onClick={() => setCurrentTradeWindow("orderbook")}
        />

        <TradeOption
          icon={
            <Users className="w-12 h-12 mb-4 text-purple-600 dark:text-purple-400" />
          }
          title="OTC"
          description="Trade Over-the-Counter with your chosen counterparty"
          onClick={() => setCurrentTradeWindow("otc")}
        />
      </div>
    </div>
  );
};

const TradeOption = ({ icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
  >
    {icon}
    <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
      {title}
    </h2>
    <p className="text-sm text-center text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </button>
);

export default ChooseMethod;
