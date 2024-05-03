import { useContext } from "react";
import { appContext } from "../../../AppContext";
import ChooseMethod from "./ChooseMethod";
import OverTheCounterTrading from "./OverTheCounterTrading";
import AcceptOTC from "./OverTheCounterTrading/Activity/AcceptOTC";

const Trade = () => {
  const { _currentNavigation, _currentTradeWindow } = useContext(appContext);

  if (_currentNavigation !== "trade") {
    return null;
  }

  if (_currentTradeWindow === null) {
    return (
      <div className="mx-4 md:mx-0 text-left">
        <ChooseMethod />
      </div>
    );
  }

  return (
    <div className="mx-4 md:mx-0 text-left">
      <OverTheCounterTrading />
      <AcceptOTC />
      {/* <OrderBookTrading /> */}
    </div>
  );
};

export default Trade;
