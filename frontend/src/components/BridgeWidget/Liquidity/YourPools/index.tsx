import { useEffect, useState } from "react";
import {
  getMyOrderBook,
  setUserOrderBook,
} from "../../../../../../dapp/js/orderbook.js";
import WrappedPool from "./WrappedPool/index.js";

const YourPools = () => {
  const [myOrderBook, setOrderBook] = useState<any>(null);

  useEffect(() => {
    // get our pools
    getMyOrderBook(function (orderBook) {
      console.log(orderBook);
      setOrderBook(orderBook);
    });
  }, []);

  return (
    <div>
      <WrappedPool />
      {/* <TetherPool /> */}
    </div>
  );
};

export default YourPools;
