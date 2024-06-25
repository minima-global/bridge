import { useContext, useEffect, useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { getSimpleOrderBookTotals } from "../../../../../../../dapp/js/orderbook.js";
import { createFavsOrderBookSimpleTotals } from "../../../../../../../dapp/js/orderbook.js";
import { PRICE_BOOK_STEPS } from "../../../../../../../dapp/js/htlcvars.js";

import { appContext } from "../../../../../AppContext.js";

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
  } | null>();

  useEffect(() => {
    if (!fav) {
      getSimpleOrderBookTotals((totals) => {
        if (totals.length === 0) return;

        const bk = totals[book][`${type}book`];

        if (bk.length === 0) {
          return setChart({
            quantity: [],
            price:[]
          });
        }

        let quantity: number[] = [];
        let price: number[] = [];
        for (var i = 0; i < PRICE_BOOK_STEPS + 1; i++) {
          var priceamountbuy = bk[i];
          quantity.push(priceamountbuy.amount);
          price.push(priceamountbuy.price);
        }

        setChart({
          quantity,
          price,
        });
      });
    } else {
      createFavsOrderBookSimpleTotals(_userDetails, (totals) => {
        if (totals.length === 0) return;

        const bk = totals[book][`${type}book`];

        if (bk.length === 0) {
          return setChart({
            quantity: [],
            price:[]
          });
        }

        let quantity: number[] = [];
        let price: number[] = [];
        for (var i = 0; i < PRICE_BOOK_STEPS + 1; i++) {
          var priceamountbuy = bk[i];
          quantity.push(priceamountbuy.amount);
          price.push(priceamountbuy.price);
        }

        setChart({
          quantity,
          price,
        });
      });
    }
  }, [type, book, fav]);

  const hasOrderBook = chart && chart.price.length && chart.quantity.length;
  return (
    <>
      {!hasOrderBook && (
        <div className="min-h-[200px] flex justify-center items-center">
          <p className="text-xs text-center opacity-50">Order book empty</p>
        </div>
      )}
      {!!hasOrderBook && (
        <Bar
          className="!w-full !h-full max-h-[250px] relative dark:bg-[#1B1B1B] rounded-lg p-1"
          data={{
            labels: chart.quantity,
            datasets: [
              {
                label: "Price",
                backgroundColor: "#99f6e4",
                borderColor: "#5eead4",
                borderWidth: 3,
                hoverBackgroundColor: "rgba(75,192,192,0.4)",
                hoverBorderColor: "rgba(75,192,192,1)",
                data: chart.price,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false, // Set to false to allow aspect ratio to be controlled by aspectRatio property
            responsive: true,
            plugins: {
              legend: {
                position: "top" as const,
              },
              title: {
                display: true,
                // text: "",
              },
            },
            scales: {
              y: {
                ticks: {
                  color: "#9ca3af", // Change the color of y-axis labels
                  font: {
                    weight: "bold",
                  },
                },
                grid: {
                  color: "#9ca3af", // Change the color of y-axis grid lines (if needed)
                },
                title: {
                  display: true,
                  text: 'Price',
                  color: 'rgb(94 234 212)',
                  font: {
                    family: 'monospace',
                    size: 12,
                    weight: 'bold',
                    lineHeight: 1.2,
                  },
                  // padding: {top: 20, left: 0, right: 0, bottom: 0}
                }
              },
              x: {
                ticks: {
                  color: "#9ca3af", // Change the color of x-axis labels
                  font: {
                    weight: "bold",
                  },
                },
                grid: {
                  color: "#5eead4", // Change the color of x-axis grid lines (if needed)
                },
                title: {
                  display: true,
                  text: 'Native Minima',
                  color: 'rgb(94 234 212)',
                  font: {
                    family: 'monospace',
                    size: 12,
                    weight: 'bold',
                    lineHeight: 1.2,
                  },
                  // padding: {top: 20, left: 0, right: 0, bottom: 0}
                }
              },
            },
          }}
        />
      )}
    </>
  );
};

export default Charts;
