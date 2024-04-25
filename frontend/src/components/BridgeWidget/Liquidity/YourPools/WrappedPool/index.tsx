import { useEffect, useState } from "react";
import { getMyOrderBook } from "../../../../../../../dapp/js/orderbook.js";

const WrappedPool = () => {
  const [wrappedPool, setWrappedPool] = useState<any>(null);

  useEffect(() => {
    // get our pools
    getMyOrderBook(function (orderBook) {
      console.log(orderBook);
      const { wminima } = orderBook;
      setWrappedPool(wminima);
    });
  }, []);

  return (
    <div className="bg-slate-100 dark:bg-[#1B1B1B] border border-[#1B1B1B] rounded-lg p-4">
      <div>
        <h3 className="text-sm font-bold mb-2 text-center">
          Native/wMinima Pool
        </h3>
      </div>
      <hr className="border-teal-300 mb-4" />
      <div className="grid grid-cols-2 bg-slate-300 dark:bg-[#1B1B1B] relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 bg-teal-300 w-1" />

          <label className="text-[12px] font-bold mb-1 pl-4">
            I want to buy Minima for
          </label>
          <div className="grid grid-cols-2 items-center pl-4">
            <input
              value={wrappedPool ? wrappedPool.buy : 0}
              className="dark:bg-[#1B1B1B] rounded font-mono focus:outline-none truncate"
              placeholder="0"
            />
            <span className="text-[12px] font-bold">wMinima</span>
          </div>
        </div>
        {/* Vertical separator */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 bg-orange-300 w-1" />
          <label className="text-[12px] font-bold mb-1 pl-4">
            I want to sell Minima for
          </label>
          <div className="grid grid-cols-2 items-center pl-4">
            <input
              value={wrappedPool ? wrappedPool.sell : 0}
              className="bg-slate-300 dark:bg-[#1B1B1B] font-mono rounded focus:outline-none truncate"
              placeholder="0"
            />
            <span className="text-[12px] font-bold">wMinima</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {wrappedPool && !wrappedPool.enable && (
          <button className="hover:bg-teal-600 bg-teal-500 text-[#1B1B1B] font-bold">
            Enable
          </button>
        )}

        {wrappedPool && wrappedPool.enable && (
          <div className="w-full grid grid-cols-[1fr_auto] gap-1">
            <button className="hover:bg-teal-600 bg-teal-500 text-[#1B1B1B] font-bold">
              Update
            </button>
            <button className="hover:bg-opacity-90 bg-white text-[#1B1B1B] font-bold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"   
                className="w-[24px] height-[24px] mx-auto"             
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WrappedPool;
