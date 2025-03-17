import { FormikContextType, FormikValues, useFormikContext } from "formik";
import Charts from "../../Charts";
import InputWrapper from "../../../../../UI/FormComponents/InputWrapper";
import { useState } from "react";

const TetherPool = ({ onShowConfirm }) => {
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
      <Charts fav={favorites} book="usdt" type="buy" />
      <Charts fav={favorites} book="usdt" type="sell" />

      <form className={`pb-8 pt-4`}>        
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

export default TetherPool;
