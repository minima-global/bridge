import WrappedPool from "./WrappedPool/index.js";
import TetherPool from "./TetherPool/index.js";
import { OrderBookProvider } from "../../../../hooks/useOrderBook.js";

const YourPools = () => {
  return (
    <div className="flex flex-col gap-3">
      <OrderBookProvider>
        <WrappedPool />
        <TetherPool />
      </OrderBookProvider>
    </div>
  );
};

export default YourPools;
