import { useContext } from "react";
import TetherPool from "../Pools/TetherPool";
import WrappedPool from "../Pools/WrappedPool";
import { appContext } from "../../../../../AppContext";


const OrderBookForm = () => {
  const { _currentOrderPoolTrade } =
    useContext(appContext);

  return (
    <div>
      {_currentOrderPoolTrade === "wminima" && <WrappedPool />}
      {_currentOrderPoolTrade === "usdt" && <TetherPool />}
    </div>
  );
};

export default OrderBookForm;
