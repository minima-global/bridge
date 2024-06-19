import { useContext, useEffect } from "react";
import OrderItem from "./OrderItem/index.js";
import { appContext } from "../../../../../AppContext.js";


const OrderHistory = () => {
  const { orders, getAllOrders } = useContext(appContext);
  
  useEffect(() => {
    getAllOrders();
  }, []);

  return (
    <div
      className={`my-4 bg- bg-gray-100 bg-opacity-50 dark:bg-[#1B1B1B] rounded-lg ${
        !orders.length && "min-h-[250px] grid grid-rows-[auto_1fr]"
      }`}
    >
      <h3 className="font-bold p-3 pb-0">Order History</h3>
      {!orders.length && (
        <div className="h-full flex items-center justify-center">
          <p className="text-xs text-center">No orders available</p>
        </div>
      )}
      {!!orders.length && (
        <ul className="overflow-y-auto max-h-[300px]">
          {orders.map((order) => (
            <OrderItem key={order.HASH} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistory;
