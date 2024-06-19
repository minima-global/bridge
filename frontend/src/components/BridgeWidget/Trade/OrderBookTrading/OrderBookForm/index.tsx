import { useContext } from "react";
import TetherPool from "../Pools/TetherPool";
import WrappedPool from "../Pools/WrappedPool";
import { appContext } from "../../../../../AppContext";
import OrderHistory from "../OrderHistory";

// import { getCompleteOrderBook } from "../../../../../../../dapp/js/orderbook.js";


const OrderBookForm = () => {
  const { _currentOrderPoolTrade } =
    useContext(appContext);


    // useEffect(() => {
    //   getCompleteOrderBook((resp) => {
    //     console.log(resp.filter(o => o.maximapublickey !== _userDetails.maximapublickey));
    //   });
    // }, [])

  return (
    <div>
      {_currentOrderPoolTrade === "wminima" && <WrappedPool />}
      {_currentOrderPoolTrade === "usdt" && <TetherPool />}


      <OrderHistory />
    </div>
  );
};

export default OrderBookForm;
