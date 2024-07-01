import { createPortal } from "react-dom";
import { useSpring, animated, config } from "react-spring";
import Dialog from "../UI/Dialog";
import { useContext } from "react";
import { appContext } from "../../AppContext";

const ReadMode = () => {
  const { _promptReadMode } = useContext(appContext);

  const springProps = useSpring({
    opacity: _promptReadMode ? 1 : 0,
    transform: _promptReadMode
      ? "translateY(0%) scale(1)"
      : "translateY(-50%) scale(0.8)",
    config: config.wobbly,
  });

  if (!_promptReadMode) {
    return null;
  }

  return createPortal(
    <Dialog>
      <div className="grid grid-rows-[80px_1fr] mx-4 md:mx-0">
        <div />
        <animated.div style={springProps}>
          <div className="z-50 flex items-center justify-center">
            <div className="z-10 bg-black rounded-lg p-8 text-white text-center relative shadow-sm shadow-purple-300">
              <div className="flex items-center justify-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="#f5f5f4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M5 11a7 7 0 0 1 14 0v7a1.78 1.78 0 0 1 -3.1 1.4a1.65 1.65 0 0 0 -2.6 0a1.65 1.65 0 0 1 -2.6 0a1.65 1.65 0 0 0 -2.6 0a1.78 1.78 0 0 1 -3.1 -1.4v-7" />
                  <path d="M10 10h.01" />
                  <path d="M14 10h.01" />
                </svg>
              </div>

              <h1 className="text-3xl font-bold mb-4">Read Mode</h1>
              <p className="text-lg mb-6">This app is currently in read mode</p>
              <p className="text-sm mb-6">
                You need to set it on write mode to use it.
              </p>
              <RetroButton
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.reload();
                }}
              >
                Reload
              </RetroButton>
            </div>
          </div>
        </animated.div>
      </div>
    </Dialog>,
    document.body
  );
};

export default ReadMode;
const RetroButton = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className="bg-purple-600 w-full hover:bg-purple-700 text-white font-bold py-2 px-4 rounded border border-purple-600 hover:border-transparent transition duration-300 ease-in-out"
    >
      {children}
    </button>
  );
};
