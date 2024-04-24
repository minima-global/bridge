
import Deposit from "../Deposit";
import Balance from "./Balance";

const BridgeWidget = () => {

  return (
    <div className="text-center my-4">
      <Deposit />
      <Balance />
    </div>
  );
};

export default BridgeWidget;
