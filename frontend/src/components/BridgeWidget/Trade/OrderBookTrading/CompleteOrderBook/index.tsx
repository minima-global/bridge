import { useContext, useEffect, useState } from "react";
import { getCompleteOrderBook, getMyOrderBook } from "../../../../../../../dapp/js/orderbook.js";
import Order from "./Order/index.js";
import { Order as OrderInterface } from "../../../../../types/Order.js";
import { PoolData } from "../../../../../types/Pool.js";
import { appContext } from "../../../../../AppContext.js";
import Bear from "../../../../UI/Avatars/Bear/index.js";

export default function CompleteOrderBook() {
  const [orderBook, setOrderBook] = useState<OrderInterface[]>([]);
  const [_currentOrderBook, setMyOrderBook] = useState<PoolData | null>(null);
  const { getAndSetFavorites, _userDetails, _currentNavigation } = useContext(appContext);

  useEffect(() => {
    if (_currentNavigation === "trade") {
      getMyOrderBook(setMyOrderBook);
      getCompleteOrderBook((resp) => {
        setOrderBook(resp.filter((o) => o.maximapublickey !== _userDetails.maximapublickey));
      });
      getAndSetFavorites();
    }
  }, [_currentNavigation, _userDetails.maximapublickey]);

  return (
    <div className="bg-neutral-100 shadow-lg dark:shadow-none dark:bg-[#1b1b1b] rounded-lg p-4">
      {_currentOrderBook && <MyOrderBook orderBook={_currentOrderBook} userDetails={_userDetails} />}
      
      <ul className="space-y-4 mt-4">
        {orderBook.length === 0 && (
          <p className="text-center text-xs font-bold text-gray-600 dark:text-gray-400">No orderbook found</p>
        )}
        {orderBook.map((order) => (
          <Order data={order} key={order.data.publickey} />
        ))}
      </ul>
    </div>
  );
}

interface MyOrderBookProps {
  orderBook: PoolData;
  userDetails: { minimapublickey: string };
}

function MyOrderBook({ orderBook, userDetails }: MyOrderBookProps) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Bear extraClass="w-[32px]" input={userDetails.minimapublickey} />
          <div>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">My Book</p>
            <input
              readOnly
              value={userDetails.minimapublickey}
              className="bg-transparent cursor-default focus:outline-none text-[10px] w-full truncate font-mono text-gray-600 dark:text-gray-400"
            />
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {orderBook.wminima.enable && (
            <img className="w-[16px] h-[16px] rounded-full" alt="wminima" src="./assets/wtoken.svg" />
          )}
          {orderBook.usdt.enable && (
            <img className="w-[14px] h-[14px]" alt="usdt" src="./assets/tether.svg" />
          )}
          {!orderBook.wminima.enable && !orderBook.usdt.enable && (
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Disabled</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {orderBook.usdt.enable && (
          <OrderBookRow
            title="USDT"
            buy={orderBook.usdt.buy}
            sell={orderBook.usdt.sell}
          />
        )}
        {orderBook.wminima.enable && (
          <OrderBookRow
            title="WMINIMA"
            buy={orderBook.wminima.buy}
            sell={orderBook.wminima.sell}
          />
        )}
      </div>
    </div>
  );
}

interface OrderBookRowProps {
  title: string;
  buy: number;
  sell: number;
}

function OrderBookRow({ title, buy, sell }: OrderBookRowProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded p-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-800 dark:text-gray-200">Native ↔ {title}</span>
        <div className="flex space-x-4">
          <span className="text-gray-700 dark:text-gray-300">Buy: <span className="font-mono text-gray-900 dark:text-gray-100">{buy}</span></span>
          <span className="text-gray-700 dark:text-gray-300">Sell: <span className="font-mono text-gray-900 dark:text-gray-100">{sell}</span></span>
        </div>
      </div>
    </div>
  );
}