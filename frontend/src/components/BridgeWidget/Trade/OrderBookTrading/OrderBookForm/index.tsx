import { useContext, useEffect } from "react";
import TetherPool from "../Pools/TetherPool";
import WrappedPool from "../Pools/WrappedPool";
import { appContext } from "../../../../../AppContext";


const OrderBookForm = () => {
  const { loaded, _currentOrderPoolTrade, getWalletBalance } =
    useContext(appContext);

  useEffect(() => {
      if (loaded && loaded.current) {
        getWalletBalance();
      }
  }, [loaded]);

  return (
    <div>
      {_currentOrderPoolTrade === "wminima" && <WrappedPool />}
      {_currentOrderPoolTrade === "usdt" && <TetherPool />}
    </div>
  );
};

export default OrderBookForm;
