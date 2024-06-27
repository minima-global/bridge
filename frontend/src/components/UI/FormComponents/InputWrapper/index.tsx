import { FormikErrors } from "formik";
import { ReactNode, useState } from "react";

interface Props {
  label: string;
  inputProps: any;
  errors: string | false | string[] | FormikErrors<any> | FormikErrors<any>[];
  action?: ReactNode;
  wrapperStyle?: string;
  orderbook?: boolean;
  orderbookFocus?: boolean;
  setOrderFocus?: any;
}

const InputWrapper = ({
  label,
  inputProps,
  action,
  wrapperStyle,
  errors,
  orderbook,
  orderbookFocus,
  setOrderFocus
}: Props) => {
  const [_f, setF] = useState(false);

  const hasAction = !!action;

  return (
    <div>
      <div
        className={`${wrapperStyle} ${
          errors && "outline !outline-red-500"
        } grid ${!orderbook && _f ? "outline dark:outline-yellow-300" : ""} ${
          hasAction ? "sm:grid-cols-[1fr_minmax(0,_120px)]" : "grid-cols-1"
        } rounded bg-gray-100 bg-opacity-50 dark:bg-[#1B1B1B]`}
      >
        <div className="px-4 py-4">
          <label
            className={`${errors && "!text-red-500"} ${
              !orderbook && _f ? "dark:text-yellow-300" : ""
            } ${
              orderbookFocus ? "dark:text-yellow-300" : ""
            } font-bold text-sm dark:opacity-70`}
          >
            {label}
          </label>
          <input
            {...inputProps}
            className="bg-gray-100 font-mono bg-opacity-50 dark:bg-[#1B1B1B] truncate w-full focus:outline-none"
            onBlur={(e) => {

              setOrderFocus ? setOrderFocus(false) : null

              try {
                inputProps.onBlur(e);
                
              } catch (error) {
                
              }
              
              
              !orderbook ?
              setF(false) : null;
              
            }}
            onFocus={() => {orderbook ? setF(true) : null; setOrderFocus ? setOrderFocus(true) : null}}
          />
        </div>
        {action}
      </div>
      {errors && (
        <p className="p-2 bg-red-500 text-white dark:text-black font-bold rounded-lg mt-3 mb-2 outline outline-red-500">
          {typeof errors === 'string' ? errors : "N/A"}
        </p>
      )}
    </div>
  );
};

export default InputWrapper;
