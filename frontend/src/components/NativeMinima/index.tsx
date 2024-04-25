import { useContext } from "react";
import { appContext } from "../../AppContext";

const NativeMinima = () => {
  const { _minimaBalance } = useContext(appContext);

  if (_minimaBalance === null) {
    return null;
  }

  return (
    <div className="grid grid-cols-[auto_1fr] bg-white items-center rounded-md bg-opacity-30 dark:bg-[#1B1B1B] p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2">
      <img
        alt="token-icon"
        src="./assets/token.svg"
        className="w-[36px] h-[36px] rounded-full"
      />

      <div className="flex justify-between ml-2 text-left">
        <div>
          <h3 className="font-bold ">Minima</h3>
          <p className="font-mono text-sm">{_minimaBalance.confirmed}</p>
        </div>        
      </div>
    </div>
  );
};

export default NativeMinima;
