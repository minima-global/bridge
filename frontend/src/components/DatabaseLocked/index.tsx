import { useContext } from "react";
import { appContext } from "../../AppContext";
import AnimatedDialog from "../UI/AnimatedDialog";
import { primaryButtonStyle } from "../../styles";

const DatabaseLocked = () => {
  const { _promptDatabaseLocked } = useContext(appContext);

  return (
    <AnimatedDialog
      display={_promptDatabaseLocked}
      dismiss={() => {
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

        <div className="h-full flex flex-col">
          <div className="px-2">
            <p className="text-sm my-3">
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
              className={`${primaryButtonStyle} w-full`}
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
