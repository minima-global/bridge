import { useContext, useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  getSimpleOrderBookTotals,
  createFavsOrderBookSimpleTotals,
} from "../../../../../../../dapp/js/orderbook.js";
import { PRICE_BOOK_STEPS } from "../../../../../../../dapp/js/htlcvars.js";
import { appContext } from "../../../../../AppContext.js";
import {
  TrendingUp,
  TrendingDown,
  Loader,
  RefreshCw,
  Info,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface IProps {
  fav: boolean;
  book: string;
  type: string;
}

const Charts = ({ book, type, fav = false }: IProps) => {
  const { _userDetails } = useContext(appContext);
  const [chart, setChart] = useState<{
    quantity: number[];
    price: number[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchData = () => {
    setLoading(true);
    const fetchFunction = fav
      ? createFavsOrderBookSimpleTotals
      : getSimpleOrderBookTotals;
    fetchFunction(_userDetails, (totals) => {
      if (totals.length === 0) {
        setLoading(false);
        return;
      }

      const bk = totals[book][`${type}book`];

      if (bk.length === 0) {
        setChart({ quantity: [], price: [] });
        setLoading(false);
        return;
      }

      let quantity: number[] = [];
      let price: number[] = [];
      for (var i = 0; i < PRICE_BOOK_STEPS + 1; i++) {
        var priceamountbuy = bk[i];
        quantity.push(priceamountbuy.amount);
        price.push(priceamountbuy.price);
      }

      setChart({ quantity, price });
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, [type, book, fav, _userDetails]);

  const hasOrderBook = chart && chart.price.length && chart.quantity.length;

  const chartColor = type === "buy" ? "rgb(20 184 166)" : "rgb(239 68 68)";
  const chartData = {
    labels: chart?.quantity || [],
    datasets: [
      {
        label: `Price (${book.toUpperCase()})`,
        backgroundColor: chartColor,
        borderColor: chartColor,
        borderWidth: 3,
        hoverBackgroundColor: chartColor,
        hoverBorderColor: chartColor,
        data: chart?.price || [],
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: chartColor,
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
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#9ca3af",
          font: {
            weight: "bold",
          },
          callback: function (value) {
            return (value as number).toFixed(4);
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        title: {
          display: true,
          text: `Price (${book.toUpperCase()})`,
          color: chartColor,
          font: {
            family: "system-ui",
            size: 12,
            weight: "bold",
          },
        },
      },
      x: {
        ticks: {
          color: "#9ca3af",
          font: {
            weight: "bold",
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.1)",
        },
        title: {
          display: true,
          text: "Quantity of native MINIMA",
          color: chartColor,
          font: {
            family: "system-ui",
            size: 12,
            weight: "bold",
          },
        },
      },
    },
  };

  const getTooltipText = () => {
    if (book === "usdt") {
      return `This chart shows ${
        type === "buy" ? "buy" : "sell"
      } orders for native MINIMA. 
        The x-axis represents the quantity of native MINIMA ${
          type === "buy" ? "being bought" : "available for sale"
        }, 
        while the y-axis shows the price in USDT for each unit of native MINIMA.`;
    } else {
      return `This chart shows ${
        type === "buy" ? "buy" : "sell"
      } orders for native MINIMA. 
        The x-axis represents the quantity of native MINIMA ${
          type === "buy" ? "being bought" : "available for sale"
        }, 
        while the y-axis shows the price in wMINIMA for each unit of native MINIMA.`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
          {type === "buy" ? (
            <TrendingUp className="w-5 h-5 mr-2 text-teal-500" />
          ) : (
            <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
          )}
          {type.charAt(0).toUpperCase() + type.slice(1)} Orders (Native MINIMA /{" "}
          {book.toUpperCase()})
        </h3>
        <div className="flex items-center">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 mr-2"
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
      {loading ? (
        <div className="min-h-[250px] flex justify-center items-center">
          <Loader className="w-8 h-8 text-teal-500 animate-spin" />
        </div>
      ) : !hasOrderBook ? (
        <div className="min-h-[250px] flex justify-center items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {type === "buy" ? "Buy" : "Sell"} order book empty
          </p>
        </div>
      ) : (
        <div className="h-[250px]">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default Charts;
