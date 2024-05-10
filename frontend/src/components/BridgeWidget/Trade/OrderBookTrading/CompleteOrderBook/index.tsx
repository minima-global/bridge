import { useContext, useEffect, useState } from "react";

import { getCompleteOrderBook } from "../../../../../../../dapp/js/orderbook.js";
import Order from "./Order/index.js";
import { Order as OrderInterface } from "../../../../../types/Order.js";
import { appContext } from "../../../../../AppContext.js";

const CompleteOrderBook = () => {
  const [orderBook, setOrderBook] = useState<OrderInterface[]>();
  const { _favorites , getAndSetFavorites} = useContext(appContext);

  useEffect(() => {
    getCompleteOrderBook((resp) => {
        console.log(resp);
      setOrderBook(resp);
    });

    getAndSetFavorites();
  }, []);

  return (
    <div>
      <ul>
        {orderBook?.map((order) => (
          <Order data={order} favorites={_favorites} key={order.maximapublickey} />
        ))}
      </ul>
    </div>
  );
};

export default CompleteOrderBook;
