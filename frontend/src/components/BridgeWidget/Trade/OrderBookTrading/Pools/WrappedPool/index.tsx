import { FormikContextType, FormikValues, useFormikContext } from "formik";
import { useState } from "react";
import NativeMinima from "../../../../../NativeMinima";
import InputWrapper from "../../../../../UI/FormComponents/InputWrapper";
import WrappedToken from "../WrappedPoolOld/WrappedToken";
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  BarChart2,
  ArrowDownUp,
} from "lucide-react";
import DepthChart from "../../Charts";

interface WrappedPoolProps {
  onShowConfirm: (action: "buy" | "sell") => void;
}

const WrappedPool: React.FC<WrappedPoolProps> = ({ onShowConfirm }) => {
  const [focused, setFocused] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formik: FormikContextType<FormikValues> = useFormikContext();
  const { dirty, errors, touched, getFieldProps } = formik;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-6 sm:space-y-0 sm:space-x-6">
            <div className="w-full sm:w-auto">
              <NativeMinima />
            </div>
            <div className="flex justify-center">
              <div className="bg-violet-100 dark:bg-violet-900 rounded-full p-3">
                <ArrowDownUp className="w-8 h-8 text-violet-500 sm:hidden" />
                <ArrowRightLeft className="w-8 h-8 text-violet-500 hidden sm:block" />
              </div>
            </div>
            <div className="w-full sm:w-auto">
              <WrappedToken />
            </div>
          </div>

          <InputWrapper
            orderbook={true}
            orderbookFocus={focused}
            errors={
              errors && errors.native && touched && touched.native
                ? errors.native
                : false
            }
            wrapperStyle="mb-6"
            inputProps={{
              placeholder: "0.0",
              ...getFieldProps("native"),
              className: "text-xl sm:text-2xl font-medium",
            }}
            label="Amount of Minima"
            setOrderFocus={setFocused}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              disabled={!!errors.native || !dirty}
              onClick={() => onShowConfirm("buy")}
              type="button"
              className="py-4 px-6 rounded-lg font-bold text-lg text-white bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors duration-200"
            >
              Buy
            </button>
            <button
              disabled={!!errors.native || !dirty}
              onClick={() => onShowConfirm("sell")}
              type="button"
              className="py-4 px-6 rounded-lg font-bold text-lg text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:text-gray-500 transition-colors duration-200"
            >
              Sell
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="bg-transparent w-full py-4 px-6 text-left text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart2 className="w-6 h-6 mr-3 text-violet-500" />
              Advanced View
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-6 h-6 text-gray-500" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-500" />
            )}
          </div>
        </button>
      </div>

      {showAdvanced && (
        <div className="bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div className="p-4 sm:p-6 overflow-x-auto">
            <div className="min-w-[600px]">
              <DepthChart book="wminima" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WrappedPool;