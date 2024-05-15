import { useContext } from "react";
import { appContext } from "../../AppContext";
import MainActivity from "../MainActivity";
import SettingsIcon from "../UI/Icons/SettingsIcon";
import FavoriteIcon from "../UI/Icons/FavoriteIcon";

const Header = () => {
  const { promptSettings, promptFavorites } = useContext(appContext);
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
                className="w-[100px] h-[36px]"
              />
            </div>
          </div>
          <div className="mb-auto">
            <p className="text-center text-xs tracking-tighter text-sky-400 font-bold shadow-violet-300 dark:text-yellow-100  shadow-sm dark:shadow-yellow-300 max-w-max mx-auto px-4">
              TESTING PURPOSE ONLY
            </p>
          </div>
          <div className="flex justify-end">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <MainActivity />

              <span className="pr-2 text-red-400" onClick={promptFavorites}>
                <FavoriteIcon fill="currentColor" />
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
