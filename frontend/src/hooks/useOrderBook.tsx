import { createContext, useContext, useEffect, useState } from "react";
import {
  getMyOrderBook,
  setUserOrderBook,
} from "../../../dapp/js/orderbook.js";
import { PoolData } from "../types/Pool.js";

type OrderBookContext = {
  _currentOrderBook: PoolData | null;
  updateBook: (book: PoolData) => void;
}
// Create a context for the order book
const OrderBookContext = createContext<OrderBookContext | null>(null);

export const useOrderBookContext = () => {
  const context = useContext(OrderBookContext);

  if (!context)
    throw new Error(
      "WalletContext must be called from within the WalletContextProvider"
    );

  return context;
};

// Provider component to manage the order book state
export const OrderBookProvider = ({ children }) => {
  const [_currentOrderBook, setOrderBook] = useState<PoolData | null>(null);

  // Fetch the order book on component mount
  useEffect(() => {
    getBook();
  }, []);

  // Function to fetch the order book
  const getBook = () => {
    getMyOrderBook(function (orderBook) {
      setOrderBook(orderBook);
    });
  };

  // Function to update the order book
  const updateBook = (orderBook: PoolData) => {
    const { wminima, usdt } = orderBook;
    setUserOrderBook(
      wminima.enable,
      wminima.buy,
      wminima.sell,
      wminima.minimum,
      wminima.maximum,
      usdt.enable,
      usdt.buy,
      usdt.sell,
      usdt.minimum,
      usdt.maximum,
      function (resp) {
        console.log("CURRENT FROM KEYPAIR ORDER BOOK", JSON.parse(resp.value));
        setOrderBook(orderBook);
      }
    );
  };

  return (
    <OrderBookContext.Provider value={{ _currentOrderBook, updateBook }}>
      {children}
    </OrderBookContext.Provider>
  );
};
