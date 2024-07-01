import { FormikContextType, FormikValues, useFormikContext } from "formik";
import Charts from "../../Charts";
import NativeMinima from "../../../../../NativeMinima";
import InputWrapper from "../../../../../UI/FormComponents/InputWrapper";
import { useState } from "react";
import TetherToken from "../TetherPoolOld/TetherToken";

const TetherPool = ({ onShowConfirm }) => {
  const [f, setF] = useState(false);

  const formik: FormikContextType<FormikValues> = useFormikContext();
  const { dirty, errors, touched, values, getFieldProps } = formik;
  const { favorites } = values;

  return (
    <div
      className={`pt-4 mt-4 dark:bg-[#1B1B1B] ${
        f && "shadow-lg dark:outline dark:shadow-none dark:outline-yellow-300 rounded-lg"
      }`}
    >
      <Charts fav={favorites} book="usdt" type="buy" />
      <Charts fav={favorites} book="usdt" type="sell" />

      <form className={`pb-8 pt-4`}>
        <h3 className="text-center font-bold text-black dark:text-violet-300">
          Buy/Sell Native MINIMA
        </h3>

        <div className="flex justify-end mr-3">
          <TetherToken />
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
            action={
              <div className="flex items-center justify-center pb-1 sm:pb-0">
                <NativeMinima display={true} />
              </div>
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-3 px-3">
          <button
            disabled={!!errors.native || !dirty}
            onClick={() => onShowConfirm('buy')}
            type="button"
            className="p-3 tracking-wider font-bold bg-teal-500 disabled:bg-opacity-10 disabled:text-white disabled:dark:text-[#1B1B1B]"
          >
            Buy
          </button>
          <button
            disabled={!!errors.native || !dirty}
            onClick={() => onShowConfirm('sell')}
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
