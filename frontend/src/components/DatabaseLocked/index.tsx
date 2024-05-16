import { useContext } from "react";
import { appContext } from "../../AppContext";
import AnimatedDialog from "../UI/AnimatedDialog";

const DatabaseLocked = () => {
  const { _promptDatabaseLocked } =
    useContext(appContext);

    if (!_promptDatabaseLocked) {
        return null;
    }

  return (
    <AnimatedDialog
      position="items-start mt-20"
      extraClass="max-w-sm mx-auto"
      dialogStyles="h-[400px] rounded-lg !shadow-teal-800 !shadow-sm overflow-hidden"
      isOpen={_promptDatabaseLocked}
      onClose={() => {
        if (window.navigator.userAgent.includes("Minima Browser")) {
            // @ts-ignore
            Android.showTitleBar();
          }
      }}
    >
      <>
        <div className="flex items-center px-2">
          <h3 className="my-auto font-bold">Your node is locked</h3>
        </div>

        <div className="h-full flex flex-col justify-between">
          <div className="px-2">
            <p className="font-bold text-sm my-3">
              Your node is currently locked and this MiniDapp requires it to be
              unlocked. Please unlock and refresh this page.
            </p>
          </div>

          <div className="my-3 flex justify-end items-center px-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.reload();
              }}
              type="button"
              className="disabled:bg-gray-500 hover:bg-opacity-80 w-full bg-teal-300 text-white  dark:text-black font-bold"
            >
              Reload
            </button>
          </div>
        </div>
      </>
    </AnimatedDialog>
  );
};


export default DatabaseLocked;