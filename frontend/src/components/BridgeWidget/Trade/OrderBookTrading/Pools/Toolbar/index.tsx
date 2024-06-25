import { useContext, useEffect, useRef, useState } from "react";
import SelectFavorites from "../SelectFavorites";
import { appContext } from "../../../../../../AppContext";
// import CaretIcon from "../../../../../UI/Icons/CaretIcon";
import { config, useSpring, animated } from "react-spring";
import CaretIcon from "../../../../../UI/Icons/CaretIcon";

const Toolbar = () => {
  const { _currentOrderPoolTrade, setCurrentOrderPoolTrade } =
    useContext(appContext);

  const [active, setActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const springProps = useSpring({
    opacity: active ? 1 : 0,
    transform: active ? "translateY(0%)" : "translateY(-50%)",
    config: config.stiff,
  });

  const promptDropdown = () => {
    setActive((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      onClick={() => promptDropdown()}
      className="grid grid-cols-[1fr_auto_1fr] items-center bg-gray-100 bg-opacity-30 dark:bg-black dark:bg-opacity-20 py-2 hover:bg-gray-300 hover:dark:bg-black hover:cursor-pointer"
    >
      <div />
      <div ref={dropdownRef} className="relative grid grid-cols-[1fr_auto]">
        {active && (
          <animated.div
            style={springProps}
            className="origin-top-right z-[50] w-full absolute right-0 top-[20px] mt-2 rounded-r-sm shadow-sm bg-white dark:bg-opacity-100 dark:bg-[#1B1B1B] shadow-black dark:shadow-white"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <ul className="grid grid-rows-2 divide-y divide-black">
              <li
                onClick={() => setCurrentOrderPoolTrade("usdt")}
                className={`px-2 cursor-pointer grid grid-cols-[auto_1fr] items-center gap-1 ${
                  _currentOrderPoolTrade === "usdt" &&
                  "bg-gray-100 dark:bg-black"
                } `}
              >
                <div className="my-3 flex">
                  <img
                    alt="token-icon"
                    src={"./assets/tether.svg"}
                    className="w-[22px] my-auto rounded-full"
                  />
                  <p className="text-xs font-bold my-auto ml-2">Tether</p>
                </div>
              </li>
              <li
                onClick={() => setCurrentOrderPoolTrade("wminima")}
                className={`px-2  cursor-pointer grid grid-cols-[auto_1fr] items-center gap-1 ${
                  _currentOrderPoolTrade === "wminima" &&
                  "bg-gray-100 dark:bg-black"
                } `}
              >
                <div className="my-3 flex">
                  <img
                    alt="token-icon"
                    src={"./assets/wtoken.svg"}
                    className="w-[22px] my-auto rounded-full"
                  />
                  <p className="text-xs font-bold my-auto ml-2">wMinima</p>
                </div>
              </li>
            </ul>
          </animated.div>
        )}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <h3 className="text-sm  font-bold text-center">Native</h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 10h14l-4 -4" />
            <path d="M17 14h-14l4 4" />
          </svg>
          <h3 className="text-sm font-bold text-center">
            {_currentOrderPoolTrade === "wminima" ? "WMINIMA" : "USDT"}
          </h3>
        </div>
        <CaretIcon />
      </div>
      <div className="flex justify-end px-1">
        <SelectFavorites />
      </div>
    </div>
  );
};

export default Toolbar;
