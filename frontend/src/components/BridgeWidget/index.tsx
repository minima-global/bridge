
import Deposit from "../Deposit";
import Withdraw from "../Withdraw";
import Balance from "./Balance";

const BridgeWidget = () => {

  return (
    <div className="text-center my-4">
      <Deposit />
      <Withdraw />
      <Balance />
    </div>
  );
};

export default BridgeWidget;
