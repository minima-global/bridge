import { useContext } from "react";
import { appContext } from "../../../AppContext";
import PoolIcon from "../../UI/Icons/PoolIcon/index.js";
import YourPools from "./YourPools/index.js";

const Liquidity = () => {
    const { _currentNavigation } = useContext(appContext);

  if (_currentNavigation !== "liquidity") {
    return null;
  }

  return (
    <div className="mx-4 md:mx-0 text-left">
      <div className="my-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1 items-center">
            <PoolIcon />
            <h1 className="text-lg dark:text-white font-bold">Pools</h1>
          </div>
        </div>
        <hr className="border border-gray-500 dark:border-teal-300 mb-6 mt-2 w-full mx-auto" />
      </div>
      <div>
        <YourPools />
      </div>
    </div>
  );
}


export default Liquidity;