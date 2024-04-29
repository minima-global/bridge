import { useContext } from "react";
import { appContext } from "../../../../AppContext";
import SwapIcon from "../../../UI/SwapIcon";
import Identity from "./Identity";

const OverTheCounterTrading = () => {
  const { _currentTradeWindow } = useContext(appContext);

  if (_currentTradeWindow !== "otc") {
    return null;
  }

  return (
    <div className="mx-4 md:mx-0 text-left">
      <div className="my-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 items-center">
            <SwapIcon />
            <h1 className="text-lg dark:text-white font-bold">OTC</h1>
          </div>
        </div>
        <hr className="border border-gray-500 dark:border-teal-300 mb-1 mt-2 w-full mx-auto" />

        <div className="mt-2">
          <Identity
            fullAddress
            _address="0x7775C567A42978C72F4BEB79D3139CC72354B0895C0E836BBA3F8EEDC3F8B042"
          />
        </div>
      </div>
      <div className="flex justify-center flex-col h-full items-center">
        <form>

        </form>

      </div>
    </div>
  );
};

export default OverTheCounterTrading;
