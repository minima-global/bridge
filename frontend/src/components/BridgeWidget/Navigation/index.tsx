import { useContext } from "react";
import { appContext } from "../../../AppContext";

const Navigation = () => {
  const { _currentNavigation, setCurrentNavigation } = useContext(appContext);

  const isActive = (_current: string) => {
    return _currentNavigation === _current
      ? "bg-violet-500 rounded-lg text-white dark:text-black font-bold hover:text-white dark:hover:text-black py-2"
      : "text-violet-300 hover:text-violet-400 cursor-pointer my-auto opacity-50 duration-100";
  };

  return (
    <div className="mx-4 sm:mx-0">
      <nav className="bg-violet-800 rounded-lg grid grid-cols-3 max-w-sm mx-auto text-center">
        <a
          onClick={() => setCurrentNavigation("balance")}
          className={`${isActive("balance")}`}
        >
          Balance
        </a>
        <a
          onClick={() => setCurrentNavigation("trade")}
          className={`${isActive("trade")}`}
        >
          Trade
        </a>
        <a
          onClick={() => setCurrentNavigation("liquidity")}
          className={`${isActive("liquidity")}`}
        >
          Liquidity
        </a>
      </nav>
    </div>
  );
};

export default Navigation;
