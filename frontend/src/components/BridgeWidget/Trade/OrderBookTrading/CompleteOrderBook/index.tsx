import { useContext, useEffect, useState } from "react";

import { getCompleteOrderBook } from "../../../../../../../dapp/js/orderbook.js";
import Order from "./Order/index.js";
import { Order as OrderInterface } from "../../../../../types/Order.js";
import { appContext } from "../../../../../AppContext.js";

import { getMyOrderBook } from "../../../../../../../dapp/js/orderbook.js";
import { PoolData } from "../../../../../types/Pool.js";
import Bear from "../../../../UI/Avatars/Bear/index.js";

const CompleteOrderBook = () => {
  const [orderBook, setOrderBook] = useState<OrderInterface[]>();
  const [_currentOrderBook, setMyOrderBook] = useState<PoolData | null>(null);

  // Fetch the order book on component mount
  useEffect(() => {
    getBook();
  }, []);

  // Function to fetch the order book
  const getBook = () => {
    getMyOrderBook(function (orderBook) {
      setMyOrderBook(orderBook);
    });
  };

  const { getAndSetFavorites, _userDetails, _currentNavigation } =
    useContext(appContext);

  useEffect(() => {
    if (_currentNavigation === "trade") {
      getCompleteOrderBook((resp) => {
        setOrderBook(
          resp.filter((o) => o.maximapublickey !== _userDetails.maximapublickey)
        );
      });

      getAndSetFavorites();
    }
  }, [_currentNavigation]);


  return (
    <div className="bg-neutral-100 dark:bg-[#1B1B1B] rounded-lg">
      <ul>
        {!orderBook ||
          (!orderBook.filter(
            (o) => o.maximapublickey !== _userDetails.maximapublickey
          ).length && (
            <p className="text-center text-xs font-bold">No orderbook found</p>
          ))}

        {_currentOrderBook && (
          <div className="p-4 shadow-sm">
            <div className="grid grid-cols-[46px_1fr_auto] gap-1">
              <div className="my-auto">
                <Bear
                  extraClass="w-[46px]"
                  input={_userDetails.minimapublickey}
                />
              </div>
              <div className="pt-2 pl-1">
                <p className="text-xs font-bold">My Book</p>
                <input
                  onClick={(e) => e.stopPropagation()}
                  readOnly
                  value={_userDetails.minimapublickey}
                  className="bg-transparent cursor-default focus:outline-none text-xs w-full truncate font-mono"
                />
              </div>
              <div className="flex gap-1 my-auto">
                {_currentOrderBook.wminima.enable && (
                  <img
                    className="w-[20px] h-[20px] rounded-full"
                    alt="wminima"
                    src="./assets/wtoken.svg"
                  />
                )}
                {_currentOrderBook.usdt.enable && (
                  <img
                    className="w-[18px] h-[18px]"
                    alt="usdt"
                    src="./assets/tether.svg"
                  />
                )}
                {!_currentOrderBook.wminima.enable && !_currentOrderBook.usdt.enable && <p className="text-xs font-bold text-neutral-400 dark:text-neutral-600">Disabled</p>}
              </div>
            </div>

            <div className="w-full mb-4">
              <hr className="w-full border border-neutral-200 dark:border-neutral-800 mt-4" />

              <div
                className={`my-auto ${
                  !_currentOrderBook.usdt.enable && "opacity-50"
                }`}
              >
                <div className="grid bg-gray-50 grid-cols-[1fr_auto_1fr] items-center dark:bg-[#1B1B1B] py-2 dark:bg-opacity-10">
                  <div />
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <h3 className="text-xs font-bold text-center">Native</h3>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 10h14l-4 -4" />
                      <path d="M17 14h-14l4 4" />
                    </svg>
                    <h3 className="text-xs font-bold text-center">USDT</h3>
                  </div>
                  <div />
                </div>
                <div className="grid grid-cols-2 bg-gray-50 bg-opacity-30 dark:bg-[#1B1B1B] dark:bg-opacity-50 p-2">
                  <div className="text-center border-r dark:border-teal-300">
                    <h6 className="text-xs font-bold">Buying</h6>
                    <p className="font-mono text-sm">
                      {_currentOrderBook.usdt.buy}
                    </p>
                  </div>
                  <div className="text-center">
                    <h6 className="text-xs font-bold">Selling</h6>
                    <p className="font-mono text-sm">
                      {_currentOrderBook.usdt.sell}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`my-auto ${
                  !_currentOrderBook.wminima.enable && "opacity-50"
                }`}
              >
                <div className="grid bg-gray-50 grid-cols-[1fr_auto_1fr] items-center dark:bg-[#1B1B1B] py-2 dark:bg-opacity-10">
                  <div />
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <h3 className="text-xs font-bold text-center">Native</h3>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 10h14l-4 -4" />
                      <path d="M17 14h-14l4 4" />
                    </svg>
                    <h3 className="text-xs font-bold text-center">WMINIMA</h3>
                  </div>
                  <div />
                </div>
                <div className="grid grid-cols-2 bg-gray-50 bg-opacity-30 dark:bg-[#1B1B1B] dark:bg-opacity-50 p-2">
                  <div className="text-center border-r dark:border-teal-300">
                    <h6 className="text-xs font-bold">Buying</h6>
                    <p className="font-mono text-sm">
                      {_currentOrderBook.wminima.buy}
                    </p>
                  </div>
                  <div className="text-center">
                    <h6 className="text-xs font-bold">Selling</h6>
                    <p className="font-mono text-sm">
                      {_currentOrderBook.wminima.sell}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {orderBook?.map((order) => (
          <Order data={order} key={order.data.publickey} />
        ))}
      </ul>
    </div>
  );
};

export default CompleteOrderBook;
