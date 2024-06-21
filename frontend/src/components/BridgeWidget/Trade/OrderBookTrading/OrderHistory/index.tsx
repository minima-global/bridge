import { useContext, useEffect, useRef } from "react";
import OrderItem from "./OrderItem/index.js";
import { appContext } from "../../../../../AppContext.js";


const OrderHistory = () => {
  const { orders, getAllOrders } = useContext(appContext);

  const intervalId = useRef<number | null>(null);
  
  const startPolling = () => {
    getAllOrders();
    intervalId.current = window.setInterval(getAllOrders, 30000);
  };

  const stopPolling = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start polling when the component mounts
    startPolling();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
    };
  }, []);


  return (
    <div
      className={`my-4 dark:outline shadow-lg dark:shadow-none dark:outline-violet-300 mt-0 bg- bg-gray-100 bg-opacity-50 dark:bg-[#1B1B1B] rounded-lg ${
        orders === null && "min-h-[250px] grid grid-rows-1"
      }`}
    >
      {/* <h3 className="font-bold p-3 pb-2">Order History</h3> */}
      {orders === null && (
        <div className="h-full flex items-center justify-center">
          <p className="text-xs text-center">No orders available</p>
        </div>
      )}
      {orders !== null && (
        <ul className="overflow-y-auto max-h-[300px]">
          {Object.keys(orders).map((hash) => (
            <OrderItem key={hash} order={{...orders[hash]}} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;
