import { useContext } from "react";
import { appContext } from "../../AppContext";
// import MainActivity from "../MainActivity";
import SettingsIcon from "../UI/Icons/SettingsIcon";
import FavoriteIcon from "../UI/Icons/FavoriteIcon";
import HelpIcon from "../UI/Icons/HelpIcon";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const { promptSettings, promptHelp } = useContext(appContext);
  return (
    <>
      <header
        onClick={() => {
          if (window.navigator.userAgent.includes("Minima Browser")) {
            // @ts-ignore
            Android.showTitleBar();
          }
        }}
        className="px-2 grid grid-cols-[1fr_minmax(0_,860px)_1fr]"
      >
        <div />
        <div className="grid grid-cols-3">
          <div>
            <div className="my-auto">
              <img
                alt="brand"
                src="./assets/miniswap.svg"
                className="w-[100px] h-[36px] mt-2"
              />
            </div>
          </div>
          <div className="mb-auto">
            {/* <p className="text-center text-xs tracking-tighter text-sky-400 font-bold shadow-violet-300 dark:text-yellow-100  shadow-sm dark:shadow-yellow-300 max-w-max mx-auto px-4">
              TESTING PURPOSE ONLY
            </p> */}
          </div>
          <div className="flex justify-end">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <span className="mr-2 p-2 rounded-full bg-yellow-100 text-yellow-800 text-sm" onClick={() => navigate("/activities")}>
                Activity
              </span>
              <span
                className="pr-2 text-red-400"
                onClick={() => navigate("/fav")}
              >
                <FavoriteIcon fill="currentColor" />
              </span>
              <span className="pr-2 text-teal-600" onClick={promptHelp}>
                <HelpIcon fill="currentColor" />
              </span>

              <span
                onClick={promptSettings}
                className="text-violet-300 hover:animate-spin"
              >
                <SettingsIcon fill="currentColor" />
              </span>
            </div>
          </div>
        </div>
        <div />
      </header>
    </>
  );
};

export default Header;
