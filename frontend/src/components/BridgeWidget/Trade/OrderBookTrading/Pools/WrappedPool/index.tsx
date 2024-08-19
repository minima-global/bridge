import { FormikContextType, FormikValues, useFormikContext } from "formik";
import { useState } from "react";
import NativeMinima from "../../../../../NativeMinima";
import InputWrapper from "../../../../../UI/FormComponents/InputWrapper";
import Charts from "../../Charts";
import WrappedToken from "../WrappedPoolOld/WrappedToken";

const WrappedPool = ({ onShowConfirm }) => {
  const [f, setF] = useState(false);

  const formik: FormikContextType<FormikValues> = useFormikContext();
  const { dirty, errors, touched, values, getFieldProps } = formik;
  const { favorites } = values;

  return (
    <div
      className={`bg-neutral-100 pt-4 mt-4 dark:bg-[#1B1B1B] ${
        f &&
        "shadow-lg dark:outline dark:shadow-none dark:outline-yellow-300 rounded-lg"
      }`}
    >
      <Charts fav={favorites} book="wminima" type="buy" />
      <Charts fav={favorites} book="wminima" type="sell" />

      <form className={`pb-8`}>
        <div className="flex items-center mt-5 justify-center pb-1 sm:pb-0 mx-auto gap-2">
          <NativeMinima display={true} />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-2"
          >
            <path d="M7 10h14l-4 -4" />
            <path d="M17 14h-14l4 4" />
          </svg>
          <WrappedToken extraClass="flex-col-reverse gap-0 text-sm" />
        </div>

        <div className="mx-4">
          <InputWrapper
            orderbook={true}
            orderbookFocus={f}
            errors={
              errors && errors.native && touched && touched.native
                ? errors.native
                : false
            }
            wrapperStyle="mt-2"
            inputProps={{ placeholder: "0.0", ...getFieldProps("native") }}
            label="Amount of Minima"
            setOrderFocus={setF}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 px-3">
          <button
            disabled={!!errors.native || !dirty}
            onClick={() => onShowConfirm("buy")}
            type="button"
            className="p-3 tracking-wider font-bold bg-teal-500 disabled:bg-opacity-10 disabled:text-white disabled:dark:text-[#1B1B1B]"
          >
            Buy
          </button>
          <button
            disabled={!!errors.native || !dirty}
            onClick={() => onShowConfirm("sell")}
            type="button"
            className="p-3 tracking-wider font-bold bg-red-500 disabled:bg-opacity-10 disabled:text-white disabled:dark:text-[#1B1B1B]"
          >
            Sell
          </button>
        </div>
      </form>
    </div>
  );
};

export default WrappedPool;
