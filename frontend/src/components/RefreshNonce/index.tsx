import { useContext, useState } from "react";
import AnimatedDialog from "../UI/AnimatedDialog";
import RefreshIcon from "../UI/Icons/RefreshIcon";

import { sendSimpleBackendMSG } from "../../../../dapp/js/jslib.js";
import { appContext } from "../../AppContext";
import CloseIcon from "../UI/Icons/CloseIcon/index.js";
import { primaryButtonStyle } from "../../styles/index.js";

const RefreshNonce = () => {
  const [dialog, setDialog] = useState(false);
  const { notify } = useContext(appContext);

  const toggleDialog = () => {
    setDialog((prevState) => !prevState);
  };

  const handleRefreshNonce = () => {
    sendSimpleBackendMSG("REFRESHNONCE", () => {
      notify("Resetting your nonce...");
      toggleDialog();
    });
  };

  return (
    <>
      <AnimatedDialog up={50} display={dialog} dismiss={toggleDialog}>
        <>
          <div className="flex-grow flex justify-between">
            <div className="grid grid-cols-[auto_1fr] ml-2">
              <h3 className="my-auto font-bold ml-2">Refresh Nonce?</h3>
            </div>
            <span onClick={toggleDialog}>
              <CloseIcon fill="currentColor" />
            </span>
          </div>

          <div className="px-4 py-3 text-sm flex flex-col">
            <p className="flex-grow font-bold text-sm py-3">
              If you are getting ETH nonce errors, you can try to reset it here.
            </p>
            <div className="flex pb-3">
              <div className="flex-grow" />
              <button
                type="button"
                onClick={handleRefreshNonce}
                className={primaryButtonStyle}
              >
                Refresh
              </button>
            </div>
          </div>
        </>
      </AnimatedDialog>

      <div
        className="my-4 p-2 hover:cursor-pointer bg-neutral-100 hover:bg-neutral-50 rounded-full dark:bg-[#1B1B1B] hover:dark:bg-[#2C2C2C] grid grid-cols-[auto_1fr] items-center gap-1 shadow-lg"
        onClick={toggleDialog}
      >
        <span className=" text-sky-800 dark:text-neutral-500">
          <RefreshIcon extraClass="" fill="currentColor" />
        </span>
        <p className="pl-1 text-sm">Refresh Nonce</p>
      </div>
    </>
  );
};

export default RefreshNonce;
