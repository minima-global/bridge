import { useContext } from "react";
import { appContext } from "../../../../AppContext";
import SwapIcon from "../../../UI/SwapIcon";
import Identity from "./Identity";
import OTCForm from "./OTCForm";
import Activity from "./Activity";

const OverTheCounterTrading = () => {
  const { _currentTradeWindow, _userDetails } = useContext(appContext);

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

        <div className="mt-4">
          <Identity
            fullAddress
            _address={_userDetails.otcuid}
          />
        </div>
      </div>
      <div className="grid grid-rows-[auto_auto_1fr]">
        <OTCForm />

        <div className="flex items-center justify-center">
          <hr className="border border-violet-400 my-6 w-[120px]" />
          <span className="mx-4 text-sm text-black dark:text-white font-bold">
            Activity
          </span>
          <hr className="border border-violet-400 my-6 w-[120px]" />
        </div>
        
        <Activity />
      </div>
    </div>
  );
};

export default OverTheCounterTrading;
