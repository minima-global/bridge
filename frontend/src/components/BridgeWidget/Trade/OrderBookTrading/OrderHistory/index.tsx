import { useContext, useEffect, useRef } from "react";
import OrderItem from "./OrderItem/index.js";
import { appContext } from "../../../../../AppContext.js";

const sortEventsByEvent = (data) => {
  // Step 1: Create an array of keys with their first EVENTDATE
  const eventDateEntries = Object.entries(data).map(([key, eventsArray]) => {
    const firstEventDate = (eventsArray as any)[0]?.EVENTDATE || 0; // Handle empty arrays
    return { key, firstEventDate };
  });

  // Step 2: Sort the entries based on the EVENTDATE in descending order
  eventDateEntries.sort((a, b) => b.firstEventDate - a.firstEventDate);

  // Step 3: Create a new object with the keys ordered based on sorted EVENTDATE
  const sortedData = {};
  eventDateEntries.forEach(({ key }) => {
    sortedData[key] = data[key];
  });

  // Step 4: Sort the events within each array by EVENTDATE in descending order
  Object.keys(sortedData).forEach((key) => {
    sortedData[key] = sortedData[key].sort((a, b) => b.EVENTDATE - a.EVENTDATE);
  });

  return sortedData;
};

const OrderHistory = ({ full = false }) => {
  const { orders, getAllOrders, offsetOrders } =
    useContext(appContext);

  const intervalId = useRef<number | null>(null);

  const startPolling = () => {
    getAllOrders(10, offsetOrders);
    intervalId.current = window.setInterval(() => getAllOrders(10, offsetOrders), 30000);
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
  }, [offsetOrders]);

  return (
    <div
      className={`my-4 dark:outline shadow-lg dark:shadow-none dark:outline-violet-300 mt-0 bg- bg-gray-100 bg-opacity-50 dark:bg-[#1B1B1B] rounded-lg ${
        orders === null && "min-h-[250px] grid grid-rows-1"
      } ${full && "!outline-none"}`}
    >
      {/* <h3 className="font-bold p-3 pb-2">Order History</h3> */}
      {orders === null ||
        (JSON.stringify(orders) === "{}" && (
          <div className="h-full flex items-center justify-center">
            <p className="text-xs font-bold text-center">No orders available</p>
          </div>
        ))}
      {orders !== null && (
        <ul
          className={`overflow-y-auto ${!full && "max-h-[300px]"} ${
            full && "h-full"
          }`}
        >
          {Object.keys(sortEventsByEvent(orders)).map((hash) => (
            <OrderItem key={hash} order={{ ...orders[hash] }} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;
