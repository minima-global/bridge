import { useContext } from "react";
import { appContext } from "../../AppContext";
import Decimal from "decimal.js";

interface Props {
  display: boolean;
  external?: number | string;
}
const NativeMinima = ({ display = false, external }: Props) => {
  const { _minimaBalance } = useContext(appContext);

  if (_minimaBalance === null) {
    return null;
  }

  return (
    <div
      className={`shadow-sm dark:shadow-none grid grid-cols-[40px,_1fr] bg-white items-center rounded-md bg-opacity-30 dark:bg-[#1B1B1B] p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 ${
        external && "dark:bg-opacity-10"
      } mb-2 ${
        display ? "!flex !flex-col !shadow-none !pb-0 hover:!bg-transparent !mb-0 !p-0" : ""
      }`}
    >
      <img
        alt="token-icon"
        src="./assets/token.svg"
        className="w-[36px] h-[36px] rounded-full"
      />

      <div
        className={`flex justify-between text-left truncate ${
          display ? "ml-0" : "ml-2"
        }`}
      >
        <div>
          {!display && <h3 className="font-bold ">Minima</h3>}
          {!external && (
            <p
              className={`font-mono text-sm truncate bg-transparent focus:outline-none ${
                display ? "text-[11px]" : ""
              }`}
            >
              {display && new Decimal(_minimaBalance.confirmed).toDecimalPlaces(4).toString()}

              {!display &&
                new Decimal(_minimaBalance.unconfirmed).isZero() &&
                new Decimal(_minimaBalance.confirmed).toString()}

              {!display &&
                new Decimal(_minimaBalance.unconfirmed).gt(0) &&
                new Decimal(_minimaBalance.confirmed).toString() +
                  "/" +
                  new Decimal(_minimaBalance.unconfirmed).toString()}
            </p>
          )}
          {external && (
            <p
              className={`font-mono text-sm truncate bg-transparent focus:outline-none ${
                display ? "text-[11px]" : ""
              }`}
            >
              {external}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NativeMinima;
