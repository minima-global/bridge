import React, { useState, useEffect, useContext } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Loader,
  RefreshCw,
  Info,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";

import { getSimpleOrderBookTotals } from "../../../../../../../dapp/js/orderbook.js";
import { createFavsOrderBookSimpleTotals } from "../../../../../../../dapp/js/orderbook.js";
import { appContext } from "../../../../../AppContext.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IProps {
  book: string;
  fav?: boolean;
}

interface ChartDataState {
  buyQuantity: number[];
  sellQuantity: number[];
  price: number[];
}

interface OrderBookEntry {
  amount: number;
  price: number;
}

const DepthChart: React.FC<IProps> = ({ book, fav = false }) => {
  const { 
    _userDetails,
    _currentTradeWindow,
    setCurrentTradeWindow,
    setCurrentNavigation,
    _allowanceLock,
    setPromptAllowance,
  } = useContext(appContext);

  const [chartDataState, setChartDataState] = useState<ChartDataState | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);

    const handleTotals = (totals: any) => {
      if (!totals || !totals[book]) {
        setChartDataState(null);
        setLoading(false);
        return;
      }

      const buyBook: OrderBookEntry[] = totals[book].buybook || [];
      const sellBook: OrderBookEntry[] = totals[book].sellbook || [];

      if (buyBook.length === 0 && sellBook.length === 0) {
        setChartDataState({ buyQuantity: [], sellQuantity: [], price: [] });
        setLoading(false);
        return;
      }

      // Sort buy book in descending order of price
      buyBook.sort((a, b) => b.price - a.price);
      // Sort sell book in ascending order of price
      sellBook.sort((a, b) => a.price - b.price);

      const buyQuantity: number[] = buyBook.map(entry => entry.amount);
      const sellQuantity: number[] = sellBook.map(entry => entry.amount);
      const buyPrices: number[] = buyBook.map(entry => entry.price);
      const sellPrices: number[] = sellBook.map(entry => entry.price);

      // Combine prices and ensure they're unique and sorted
      const allPrices = Array.from(new Set([...buyPrices, ...sellPrices])).sort((a, b) => a - b);

      // Create final arrays with 0s for missing data points
      const finalBuyQuantity: number[] = allPrices.map(price => {
        const index = buyPrices.indexOf(price);
        return index !== -1 ? buyQuantity[index] : 0;
      });

      const finalSellQuantity: number[] = allPrices.map(price => {
        const index = sellPrices.indexOf(price);
        return index !== -1 ? sellQuantity[index] : 0;
      });

      setChartDataState({ 
        buyQuantity: finalBuyQuantity, 
        sellQuantity: finalSellQuantity, 
        price: allPrices 
      });
      setLoading(false);
    };

    try {
      if (fav) {
        createFavsOrderBookSimpleTotals(_userDetails, handleTotals);
      } else {
        getSimpleOrderBookTotals(handleTotals);
      }
    } catch (err) {
      console.error('Error fetching order book data:', err);
      setError('An error occurred while fetching data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [book, fav, _userDetails]);

  const hasOrderBook = chartDataState && chartDataState.price.length && (chartDataState.buyQuantity.length || chartDataState.sellQuantity.length);

  const chartData: ChartData<"bar"> = {
    labels: chartDataState?.price || [],
    datasets: [
      {
        label: 'Buy',
        data: chartDataState?.buyQuantity || [],
        backgroundColor: 'rgb(20 184 166)',
        stack: 'Stack 0',
      },
      {
        label: 'Sell',
        data: chartDataState?.sellQuantity || [],
        backgroundColor: 'rgb(239 68 68)',
        stack: 'Stack 1',
      }
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'x',
    scales: {
      x: {
        reverse: true,
        stacked: false,
        title: {
          display: true,
          text: `Price (${book.toUpperCase()})`,
          color: '#9ca3af',
          font: {
            family: "system-ui",
            size: 12,
            weight: "bold",
          },
        },
        ticks: {
          color: '#9ca3af',
          font: {
            weight: 'bold',
          },
          callback: function (value) {
            return Number(this.getLabelForValue(Number(value))).toFixed(4);
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
      },
      y: {
        stacked: false,
        title: {
          display: true,
          text: 'Quantity of native MINIMA',
          color: '#9ca3af',
          font: {
            family: "system-ui",
            size: 12,
            weight: "bold",
          },
        },
        ticks: {
          color: '#9ca3af',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#9ca3af',
          font: {
            weight: 'bold',
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        cornerRadius: 4,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "decimal",
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
  };

  const getTooltipText = () => {
    return `This depth chart shows the buy and sell orders for native MINIMA. 
      The x-axis represents the price in ${book.toUpperCase()} for each unit of native MINIMA, 
      while the y-axis shows the quantity of native MINIMA at each price point. 
      The green bars represent buy orders, and the red bars represent sell orders.`;
  };

  const handleAddLiquidity = () => {
    setCurrentNavigation("liquidity");
  };

  if (_currentTradeWindow !== "orderbook") {
    return null;
  }

  return (
    <div className="w-full min-w-[600px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          Depth Chart (Native MINIMA / {book.toUpperCase()})
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddLiquidity}
            className="px-3 py-1 text-sm rounded-md bg-teal-500 text-white hover:bg-teal-600 transition-colors duration-200 flex items-center"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Add Liquidity
          </button>
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Show information"
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={fetchData}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>
      {showTooltip && (
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md mb-4 text-sm text-gray-700 dark:text-gray-300">
          {getTooltipText()}
        </div>
      )}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 mb-4" role="alert">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      {loading ? (
        <div className="min-h-[250px] flex justify-center items-center">
          <Loader className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
      ) : !hasOrderBook ? (
        <div className="min-h-[250px] flex justify-center items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Order book empty
          </p>
        </div>
      ) : (
        <div className="h-[400px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default DepthChart;