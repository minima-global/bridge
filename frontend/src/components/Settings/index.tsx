import { useContext } from "react";
import { appContext } from "../../AppContext";
import SelectNetwork from "../SelectNetwork";
import AppThemeSwitch from "../AppThemeSwitch";
import AnimatedDialog from "../UI/AnimatedDialog";
import Cross from "../UI/Cross";
import APIIcon from "../UI/Icons/APIIcon";
import ManualRefund from "../ManualRefund";
import RefreshNonce from "../RefreshNonce";

const Settings = () => {
  const { _promptSettings, promptSettings, promptJsonRpcSetup } =
    useContext(appContext);

  return (
    <AnimatedDialog display={_promptSettings} dismiss={promptSettings}>
      <div className="mx-0 sm:mx-4">
        <div className="flex justify-between items-center pr-4">
          <h3 className="font-bold ml-4">Settings</h3>
          <Cross dismiss={promptSettings} />
        </div>

        <div></div>
        <div className="flex items-center gap-2">
          <SelectNetwork />
          <AppThemeSwitch />
        </div>

        <div
          className="my-4 p-2 hover:cursor-pointer bg-neutral-100 hover:bg-neutral-50 rounded-full dark:bg-[#1B1B1B] hover:dark:bg-[#2C2C2C] grid grid-cols-[auto_1fr] items-center gap-1 shadow-lg"
          onClick={promptJsonRpcSetup}
        >
          <span className=" text-sky-800 dark:text-neutral-500">
            <APIIcon fill="currentColor" size={28} />
          </span>
          <p className="pl-1 text-sm">Setup your Infura API keys</p>
        </div>

        <ManualRefund />

        <RefreshNonce />
      </div>
    </AnimatedDialog>
  );
};

export default Settings;
