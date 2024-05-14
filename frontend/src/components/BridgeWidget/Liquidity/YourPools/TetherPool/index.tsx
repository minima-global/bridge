import { useContext, useState } from "react";
import Decimal from "decimal.js";
import { appContext } from "../../../../../AppContext.js";
import Toolbar from "../Toolbar/index.js";
import { useOrderBookContext } from "../../../../../hooks/useOrderBook.js";
import { Formik } from "formik";
import * as yup from "yup";

import {
  MINIMUM_MINIMA_TRADE,
  MAXIMUM_MINIMA_TRADE,
} from "../../../../../../../dapp/js/htlcvars.js";

const TetherPool = () => {
  const { notify } = useContext(appContext);
  const { _currentOrderBook, updateBook } = useOrderBookContext();
  const [f, setF] = useState(false);

  const handleDisable = () => {
    try {
      if (!_currentOrderBook) {
        throw new Error("Order book not available");
      }

      updateBook({
        wminima: { ..._currentOrderBook.wminima },
        usdt: { minimum: MINIMUM_MINIMA_TRADE, maximum: MAXIMUM_MINIMA_TRADE, buy:0, sell:0, enable: false },
      });
      notify("Book disabled!");
    } catch (error) {
      if (error instanceof Error) {
        // handle Error..
      }
    }
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        enable: _currentOrderBook?.usdt.enable || false,
        buy: _currentOrderBook?.usdt.buy || 0,
        sell: _currentOrderBook?.usdt.sell || 0,
        maximum: MAXIMUM_MINIMA_TRADE || 1000,
        minimum: MINIMUM_MINIMA_TRADE || 0.0001,
      }}
      onSubmit={(values) => {

        try {
          if (!_currentOrderBook) {
            throw new Error("Order book not available");
          }

          updateBook({
            wminima: { ..._currentOrderBook.wminima },
            usdt: { ...values, enable: true },
          });
          notify("Book updated!");
        } catch (error) {
          if (error instanceof Error) {
            // handle Error..
          }
        }
      }}
      validationSchema={yup.object().shape({
        sell: yup
          .number()
          .required("Enter your sell offer")
          .test("valid amount", function (val) {
            const { path, createError, parent } = this;

            try {
              if (!_currentOrderBook) {
                throw new Error("Order book not available");
              }

              if (new Decimal(val).equals(_currentOrderBook?.usdt.sell) && new Decimal(parent.buy).equals(_currentOrderBook?.usdt.buy)) {
                throw new Error("Enter new values");
              }
              
              if (new Decimal(val).isZero()) {
                throw new Error("Enter your sell offer");
              }

              if (new Decimal(val).lt(MINIMUM_MINIMA_TRADE)) {
                throw new Error("Minimum is " + MINIMUM_MINIMA_TRADE);
              }

              return true;
            } catch (error) {
              if (error instanceof Error) {
                return createError({
                  path,
                  message:
                    error && error.message ? error.message : "Invalid number",
                });
              }
            }
          }),
        buy: yup
          .number()
          .required("Enter your buy offer")
          .test("valid amount", function (val) {
            const { path, createError, parent } = this;

            try {
              if (!_currentOrderBook) {
                throw new Error("Order book not available");
              }

              if (new Decimal(val).equals(_currentOrderBook?.usdt.buy) && new Decimal(parent.sell).equals(_currentOrderBook?.usdt.sell)) {
                throw new Error("Enter new values");
              }

              if (new Decimal(val).isZero()) {
                throw new Error("Enter your buy offer");
              }

              if (new Decimal(val).lt(MINIMUM_MINIMA_TRADE)) {
                throw new Error("Minimum is " + MINIMUM_MINIMA_TRADE);
              }

              return true;
            } catch (error) {
              if (error instanceof Error) {
                return createError({
                  path,
                  message:
                    error && error.message ? error.message : "Invalid number",
                });
              }
            }
          }),
      })}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        isValid,
      }) => (
        <form
          onSubmit={handleSubmit}
          className={`shadow-sm dark:shadow-none bg-transparent dark:bg-[#1B1B1B] rounded ${
            f && "outline dark:outline-yellow-300"
          } ${(errors.sell || errors.buy) && "outline !outline-red-300"}`}
        >
          <Toolbar token="USDT" />

          <div className="grid grid-rows-[16px_1fr]">
            <div />
            <div className="px-4">
              <div className="grid grid-cols-2 bg-transparent  dark:bg-[#1B1B1B] relative divide-x-2 divide-red-300">
                <div className="relative border-l-2 border-teal-300 grid grid-cols-[1fr_auto]">
                  <div className="grid grid-cols-[1fr_auto]">
                    <div className="pl-4">
                      <label className="text-xs font-bold mb-1 text-opacity-50">
                        I want to buy Minima for
                      </label>
                      <input
                        id="buy"
                        name="buy"
                        type="number"
                        onChange={handleChange}
                        onFocus={() => setF(true)}
                        onBlur={(e) => {
                          setF(false);
                          handleBlur(e);
                        }}
                        value={values.buy}
                        className="bg-transparent w-full rounded font-mono focus:outline-none truncate"
                        placeholder="0"
                      />
                    </div>
                    <div className="my-auto pr-4">
                      <img
                        className="rounded-full w-[36px] h-[36px] my-auto"
                        alt="wrappedtoken"
                        src="./assets/tether.svg"
                      />
                    </div>
                  </div>
                </div>
                <div className="relative grid grid-cols-[1fr_auto]">
                  <div className="pl-4">
                    <label className="text-xs font-bold mb-1 text-opacity-50">
                      I want to sell Minima for
                    </label>
                    <input
                      id="sell"
                      name="sell"
                      type="number"
                      onChange={handleChange}
                      onFocus={() => setF(true)}
                      onBlur={(e) => {
                        setF(false);
                        handleBlur(e);
                      }}
                      value={values.sell}
                      className="bg-transparent w-full font-mono rounded focus:outline-none truncate"
                      placeholder="0"
                    />
                  </div>
                  <div className="my-auto">
                    <img
                      className="rounded-full w-[36px] h-[36px] my-auto"
                      alt="wrappedtoken"
                      src="./assets/tether.svg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 px-4 mb-3">
            {!values.enable && (
              <button
                type="submit"
                disabled={!isValid}
                className={`hover:bg-teal-600 w-full text-white bg-teal-500 dark:text-[#1B1B1B] font-bold disabled:bg-opacity-20 ${                  
                  (errors.sell || errors.buy) &&
                  "hover:bg-red-100 bg-red-100 !text-red-300"
                }`}
              >
                {errors.sell && errors.buy && errors.buy}                                    
                  {errors.sell && !errors.buy && errors.sell}
                  {!errors.sell && errors.buy && errors.buy}
                {!errors.sell && !errors.buy && "Enable"}
              </button>
            )}

            {values.enable && (
              <div className="w-full grid grid-cols-[1fr_minmax(0,_100px)] gap-1">
                <button
                  type="submit"
                  disabled={!isValid}
                  className={`hover:bg-teal-600 w-full text-white bg-teal-500 dark:text-[#1B1B1B] font-bold disabled:bg-opacity-20 ${                  
                    (errors.sell || errors.buy) &&
                    "hover:bg-red-100 bg-red-100 !text-red-300"
                  }`}
                >
                  {errors.sell && errors.buy && errors.buy}                                    
                  {errors.sell && !errors.buy && errors.sell}
                  {!errors.sell && errors.buy && errors.buy}                
                  {!errors.sell && !errors.buy && "Update"}
                </button>
                <button
                  type="button"
                  onClick={handleDisable}
                  className="hover:bg-opacity-90 bg-red-500 text-[#1B1B1B] font-bold"
                >
                  Disable
                </button>
              </div>
            )}
          </div>
        </form>
      )}
    </Formik>
  );
};

export default TetherPool;
