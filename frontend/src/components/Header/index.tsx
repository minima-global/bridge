import { useContext } from "react";
import { appContext } from "../../AppContext";
import MainActivity from "../MainActivity";
import SettingsIcon from "../UI/Icons/SettingsIcon";

const Header = () => {
  const { promptSettings } = useContext(appContext);
  return (
    <>
      <header className="px-2 grid grid-cols-[1fr_minmax(0_,860px)_1fr]">
        <div />
        <div className="grid grid-cols-2">
          <div>
            <div className="my-auto">
              <img
                alt="brand"
                src="./assets/miniswap.svg"
                className="w-[100px] h-[36px]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              <MainActivity />

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
