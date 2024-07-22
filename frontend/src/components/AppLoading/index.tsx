import { useContext } from "react";
import { createPortal } from "react-dom";

import Dialog from "../UI/Dialog";

import { useSpring, animated, config } from "react-spring";

import { appContext } from "../../AppContext";

const AppLoading = () => {
  const { isWorking } = useContext(appContext);
  // const [takingTooLong, setTakingTooLong] = useState(false);

  const springProps = useSpring({
    opacity: isWorking ? 1 : 0,
    transform: isWorking
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  // useEffect(() => {
  //   setTakingTooLong(false);

  //   setTimeout(() => setTakingTooLong(true), 10000);
  // }, []);

  if (!isWorking) {
    return null;
  }

  return createPortal(
    <Dialog>
      <div className="grid grid-rows-[80px_1fr] mx-4 md:mx-0 h-full">
        <div />
        <div className="flex justify-center items-end">
          <animated.div style={springProps}>
            <div className="z-50 flex items-center justify-center pb-8">
              <div className="z-10 bg-black rounded-lg px-4 py-2 text-white text-center relative shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="animate-spin"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#FFFFFF"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 6l0 -3" />
                    <path d="M16.25 7.75l2.15 -2.15" />
                    <path d="M18 12l3 0" />
                    <path d="M16.25 16.25l2.15 2.15" />
                    <path d="M12 18l0 3" />
                    <path d="M7.75 16.25l-2.15 2.15" />
                    <path d="M6 12l-3 0" />
                    <path d="M7.75 7.75l-2.15 -2.15" />
                  </svg>
                </div>

                <p className="font-bold animate-pulse">
                  Connecting...
                </p>

                {/* {takingTooLong && (
                  <div>
                    <button
                      className="bg-purple-300 my-2 text-black font-bold shadow-none"
                      onClick={promptSettings}
                    >
                      Switch Networks
                    </button>
                  </div>
                )} */}
              </div>
            </div>
          </animated.div>
        </div>
      </div>
    </Dialog>,
    document.body
  );
};

export default AppLoading;
