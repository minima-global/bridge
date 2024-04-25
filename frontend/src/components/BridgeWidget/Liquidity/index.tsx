import { useContext } from "react";
import { appContext } from "../../../AppContext";
import { getMyOrderBook, setUserOrderBook } from "../../../../../dapp/js/orderbook.js";
import PoolIcon from "../../UI/PoolIcon/index.js";
import AddLiquidity from "./AddLiquidity/index.js";
import YourPools from "./YourPools/index.js";

const Liquidity = () => {
    const { _currentNavigation } = useContext(appContext);

  if (_currentNavigation !== "liquidity") {
    return null;
  }

  return (
    <div className="mx-4 md:mx-0 text-left">
      <div className="my-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 items-center">
            <PoolIcon />
            <h1 className="text-lg dark:text-white font-bold">Pools</h1>
          </div>
        </div>
      </div>
      <div>
        {/* <AddLiquidity /> */}
        <YourPools />
      </div>
    </div>
  );
}


export default Liquidity;