import { useContext, useEffect, useRef } from "react";
import OrderItem from "./OrderItem/index.js";
import { appContext } from "../../../../../AppContext.js";
import ActivityIcon from "../../../../UI/Icons/ActivityIcon";

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
  const { orders, getAllOrders, offsetOrders, promptLogs, setSwitchLogView } =
    useContext(appContext);

  const intervalId = useRef<number | null>(null);

  const startPolling = () => {
    getAllOrders(10 + 1, offsetOrders);
    intervalId.current = window.setInterval(
      () => getAllOrders(10 + 1, offsetOrders),
      30000
    );
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
      onDoubleClick={() => {
        console.log('herro');
        promptLogs();
        setSwitchLogView("orders");
      }}
      className={`relative group my-4 dark:outline shadow-lg dark:shadow-none dark:outline-violet-300 mt-0 bg- bg-gray-100 bg-opacity-50 dark:bg-[#1B1B1B] rounded-lg ${
        orders === null && "min-h-[250px] grid grid-rows-1"
      } ${full && "!outline-none"}`}
    >
      <div className="opacity-0 transition-opacity group-hover:opacity-100 mx-auto absolute right-0 bottom-2 left-0">
        <button
          onClick={() => {
            promptLogs();
            setSwitchLogView("orders");
          }}
          type="button"
          className="bg-transparent outline w-max mx-auto dark:text-white flex justify-end gap-1 items-end dark:outline-neutral-800 text-neutral-800"
        >
          View Orders
          <span className="text-black dark:text-white">
            <ActivityIcon fill="currentColor" />
          </span>
        </button>
      </div>

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
