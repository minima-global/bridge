import { useContext, useState } from "react";
import AnimatedDialog from "../UI/AnimatedDialog";
import RefreshIcon from "../UI/Icons/RefreshIcon";

import {sendSimpleBackendMSG} from "../../../../dapp/js/jslib.js";
import { appContext } from "../../AppContext";

const RefreshNonce = () => {
  const [dialog, setDialog] = useState(false);
  const {notify} = useContext(appContext);

  const toggleDialog = () => {
    setDialog((prevState) => !prevState);
  };

  const handleRefreshNonce = () => {
    sendSimpleBackendMSG("REFRESHNONCE", () => {
        notify("Resetting your nonce...");
        toggleDialog();
    });
  }

  return (
    <>
      <AnimatedDialog
        isOpen={dialog}
        onClose={toggleDialog}
        position="items-start mt-20"
        extraClass="max-w-sm mx-auto"
        dialogStyles="h-[400px] rounded-lg !shadow-teal-800 !shadow-sm overflow-hidden"
      >
        <div className="h-full">
          <div className="flex justify-between items-center pr-4">
            <div className="grid grid-cols-[auto_1fr] ml-2">
              <h3 className="my-auto font-bold ml-2">Refresh Nonce?</h3>
            </div>
            <svg
              onClick={toggleDialog}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="4.5"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M18 6l-12 12" />
              <path d="M6 6l12 12" />
            </svg>
          </div>

          <div className="px-4 py-3 text-sm flex flex-col justify-between h-full">
            <p className="font-bold text-sm py-3">
              If you are getting ETH nonce errors, you can try to reset it here.
            </p>
            <div className="grid grid-cols-[1fr_auto] pb-3">
              <div />
              <button
                type="button"
                onClick={handleRefreshNonce}
                className="bg-black text-white font-bold dark:text-black dark:bg-teal-300"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </AnimatedDialog>

      <div
        className="my-4 p-2 pl-3 py-3 hover:cursor-pointer bg-gray-50 bg-opacity-80 dark:bg-[#1B1B1B] hover:bg-opacity-30 dark:bg-opacity-50 grid grid-cols-[auto_1fr] items-center gap-1"
        onClick={toggleDialog}
      >
        <RefreshIcon fill="currentColor" />
        <span className="font-bold pl-3">Refresh Nonce</span>
      </div>
    </>
  );
};

export default RefreshNonce;
