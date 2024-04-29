
import Deposit from "../Deposit";
import Withdraw from "../Withdraw";
import Balance from "./Balance";
import Liquidity from "./Liquidity";
import Trade from "./Trade";

const BridgeWidget = () => {

  return (
    <div className="text-center my-4">
      <Deposit />
      <Withdraw />
      <Balance />
      <Liquidity />
      <Trade />
    </div>
  );
};

export default BridgeWidget;
