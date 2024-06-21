import Decimal from "decimal.js";
import { ReactElement, useContext } from "react";
import { appContext } from "../../../../AppContext";

interface InputProps {
  tradeSide: "buy" | "sell";
  value: any;
  errors: boolean;
  tokenComponent: ReactElement;
  calculatedOrderComponent: ReactElement;
  setFocus: (state: boolean) => void;
  handleBlur: (e: any) => void;
  handleChange: (e: any) => void;
}

const WidgetInputWrapper = ({
  tradeSide,
  value,
  errors,
  tokenComponent,
  calculatedOrderComponent,
  setFocus,
  handleBlur,
  handleChange,
}: InputProps) => {
  const { _minimaBalance } = useContext(appContext);

  return (
    <div className={`grid grid-cols-2 divide-x-2 ${tradeSide === 'buy' ? "divide-red-300" : "divide-teal-300"} px-4`}>
      <div className={`px-4 border-l-2 ${tradeSide === 'buy' ? "border-teal-300" : "border-red-300"}`}>
        <div className="grid grid-cols-[1fr_36px]">
          <div className={`${errors && "animate-pulse"}`}>
            <label className="text-xs font-bold dark:text-gray-100 dark:text-opacity-30">
              {tradeSide === "buy" && "I want to buy"}
              {tradeSide === "sell" && "I want to sell"}
            </label>
            <input
              onFocus={() => {
                setFocus(true);
              }}
              onBlur={(e) => {
                setFocus(false);
                handleBlur(e);
              }}
              id="offerPrice"
              name="offerPrice"
              onChange={handleChange}
              value={value}
              className="w-full bg-transparent focus:outline-none font-mono"
              placeholder="0.0"
            />
          </div>
          <div>
            <img
              alt="token"
              src="./assets/token.svg"
              className="rounded-full w-[36px] h-[36px] my-auto"
            />
            <p className="text-xs text-center font-bold font-mono truncate mt-1">
              {new Decimal(_minimaBalance.confirmed).toString()}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-[1fr_36px]">
          <div>
            <label className="text-xs font-bold dark:text-gray-100 dark:text-opacity-30">
              {tradeSide === "buy" && "I will give"}
              {tradeSide === "sell" && "I will receive"}
            </label>

            {calculatedOrderComponent}
          </div>
          <div>{tokenComponent}</div>
        </div>
      </div>
    </div>
  );
};

export default WidgetInputWrapper;
