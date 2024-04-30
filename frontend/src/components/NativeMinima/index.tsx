import { useContext } from "react";
import { appContext } from "../../AppContext";
import Decimal from "decimal.js";

interface Props {
  display: boolean;
}
const NativeMinima = ({ display = false }: Props) => {
  const { _minimaBalance } = useContext(appContext);
  console.log("_minimaBalance", _minimaBalance);
  if (_minimaBalance === null) {
    return null;
  }

  return (
    <div
      className={`grid grid-cols-[40px,_1fr] bg-white items-center rounded-md bg-opacity-30 dark:bg-[#1B1B1B] p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2 ${display ? "!flex !flex-col !pb-0" : ""}`}
    >
      <img
        alt="token-icon"
        src="./assets/token.svg"
        className="w-[36px] h-[36px] rounded-full"
      />

      <div className={`flex justify-between text-left truncate ${display ? "ml-0" : "ml-2"}`}>
        <div>
          {!display && <h3 className="font-bold ">Minima</h3>}
          <p className={`font-mono text-sm truncate bg-transparent focus:outline-none ${display ? "text-[11px]" : ""}`}>
            {new Decimal(_minimaBalance.confirmed).toFixed(1)} {new Decimal(_minimaBalance.unconfirmed).gt(0) && !display  ? "/ "+new Decimal(_minimaBalance.unconfirmed).toFixed(1) : ""}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NativeMinima;
