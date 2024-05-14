import { useContext, useEffect, useState } from "react";

import { getCompleteOrderBook } from "../../../../../../../dapp/js/orderbook.js";
import Order from "./Order/index.js";
import { Order as OrderInterface } from "../../../../../types/Order.js";
import { appContext } from "../../../../../AppContext.js";

const CompleteOrderBook = () => {
  const [orderBook, setOrderBook] = useState<OrderInterface[]>();
  const { _favorites , getAndSetFavorites, _userDetails, _currentNavigation} = useContext(appContext);

  useEffect(() => {
    if (_currentNavigation === "trade") {
      getCompleteOrderBook((resp) => {
        setOrderBook(resp.filter(o => o.maximapublickey !== _userDetails.maximapublickey));
      });
  
      getAndSetFavorites();
    }
  }, [_currentNavigation]);


  return (
    <div>
      <ul>
        {!orderBook || !orderBook.filter(o => o.maximapublickey !== _userDetails.maximapublickey).length && <p className="text-center text-xs font-bold">No orderbook found</p>}        
        {orderBook?.map((order) => (
          <Order data={order} favorites={_favorites} key={order.maximapublickey} />
        ))}
      </ul>
    </div>
  );
};

export default CompleteOrderBook;
