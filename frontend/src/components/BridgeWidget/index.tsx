
import Deposit from "../Deposit";
import Withdraw from "../Withdraw";
import Balance from "./Balance";
import Liquidity from "./Liquidity";

const BridgeWidget = () => {

  return (
    <div className="text-center my-4">
      <Deposit />
      <Withdraw />
      <Balance />
      <Liquidity />
    </div>
  );
};

export default BridgeWidget;
