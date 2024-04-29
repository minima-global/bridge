import { useEffect, useState } from "react";
import {
  getMyOrderBook,
  setUserOrderBook,
} from "../../../dapp/js/orderbook.js";
import { PoolData } from "../types/Pool.js";


const useOrderBook = () => {
  const [_currentOrderBook, setOrderBook] = useState<PoolData | null>();

  useEffect(() => {
    getBook();
  }, []);

  const getBook = () => {
    getMyOrderBook(function (orderBook) {
      setOrderBook(orderBook);
    });
  };

  const setBook = (orderBook: PoolData) => {
    const { wminima, usdt } = orderBook;

    console.log('current wminima order', wminima);
    console.log('current usdt order', usdt);
    
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
        console.log(resp);
        setOrderBook(orderBook);
      }
    );
  };  

  const wminima = _currentOrderBook?.wminima;
  const usdt = _currentOrderBook?.usdt;

  return { getBook, setBook, wrappedPool: wminima, tetherPool: usdt };
};

export default useOrderBook;
