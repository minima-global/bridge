import { useContext } from "react";
import { appContext } from "../../AppContext";
import Dialog from "../UI/Dialog";
import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";
import SelectNetwork from "../SelectNetwork";

const Settings = () => {
  const { _promptSettings, promptSettings, promptJsonRpcSetup } =
    useContext(appContext);

  const springProps = useSpring({
    opacity: _promptSettings ? 1 : 0,
    transform: _promptSettings
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.gentle,
  });

  if (!_promptSettings) {
    return null;
  }

  return (
    <>
      {_promptSettings &&
        createPortal(
          <Dialog dismiss={promptSettings}>
            <div onClick={(e) => e.stopPropagation() } className="h-full grid items-start">
              <animated.div style={springProps}>
                <div className="bg-white min-h-[50vh] shadow-lg mt-[80px] shadow-slate-300  dark:shadow-none dark:bg-black w-[calc(100%_-_16px)] md:w-full p-4 px-0 rounded mx-auto">
                  <div className="flex justify-between items-center pr-4">
                    <h3 className="font-bold ml-4">Settings</h3>
                    <svg
                      onClick={promptSettings}
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

                  <SelectNetwork />

                  <div
                    className="mx-4 my-4 bg-violet-100 text-black p-2 px-3 rounded-full hover:bg-violet-200 hover:cursor-pointer grid grid-cols-[auto_1fr] items-center gap-1"
                    onClick={promptJsonRpcSetup}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="28"
                      height="32"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="#000000"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M16.555 3.843l3.602 3.602a2.877 2.877 0 0 1 0 4.069l-2.643 2.643a2.877 2.877 0 0 1 -4.069 0l-.301 -.301l-6.558 6.558a2 2 0 0 1 -1.239 .578l-.175 .008h-1.172a1 1 0 0 1 -.993 -.883l-.007 -.117v-1.172a2 2 0 0 1 .467 -1.284l.119 -.13l.414 -.414h2v-2h2v-2l2.144 -2.144l-.301 -.301a2.877 2.877 0 0 1 0 -4.069l2.643 -2.643a2.877 2.877 0 0 1 4.069 0z" />
                      <path d="M15 9h.01" />
                    </svg>
                    <p className="font-bold">Setup API Keys</p>
                  </div>
                </div>
              </animated.div>
            </div>
          </Dialog>,
          document.body
        )}
    </>
  );
};

export default Settings;
