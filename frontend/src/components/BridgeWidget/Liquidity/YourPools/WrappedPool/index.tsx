import { useContext, useState } from "react";
import Decimal from "decimal.js";
import { appContext } from "../../../../../AppContext.js";
import Toolbar from "../Toolbar/index.js";
import { useOrderBookContext } from "../../../../../hooks/useOrderBook.js";
import { Formik } from "formik";
import * as yup from "yup";

import { MAXIMUM_MINIMA_TRADE } from "../../../../../../../dapp/js/htlcvars.js";
import useAllowanceChecker from "../../../../../hooks/useAllowanceChecker.js";

const WrappedPool = () => {
  useAllowanceChecker();

  const { notify, _allowanceLock, setPromptAllowance } = useContext(appContext);
  const { _currentOrderBook, updateBook } = useOrderBookContext();
  const [f, setF] = useState(false);

  const handleDisable = () => {
    try {
      if (!_currentOrderBook) {
        throw new Error("Order book not available");
      }

      updateBook({
        usdt: { ..._currentOrderBook.usdt },
        wminima: {
          minimum: 1,
          maximum: MAXIMUM_MINIMA_TRADE,
          buy: 0,
          sell: 0,
          enable: false,
        },
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
        enable: _currentOrderBook?.wminima.enable || false,
        buy: _currentOrderBook?.wminima.buy || 0,
        sell: _currentOrderBook?.wminima.sell || 0,
        maximum: MAXIMUM_MINIMA_TRADE || 10000,
        minimum: _currentOrderBook?.wminima.minimum || 250,
      }}
      onSubmit={(values) => {
        try {
          if (!_currentOrderBook) {
            throw new Error("Order book not available");
          }

          updateBook({
            usdt: { ..._currentOrderBook.usdt },
            wminima: { ...values, enable: true },
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

              if (val === null) {
                throw new Error();
              }

              if (_currentOrderBook?.wminima.enable) {
                if (
                  new Decimal(val).equals(_currentOrderBook?.wminima.sell) &&
                  parent.buy &&
                  new Decimal(parent.buy).equals(
                    _currentOrderBook?.wminima.buy,
                  ) &&
                  new Decimal(parent.minimum).equals(
                    _currentOrderBook?.wminima.minimum,
                  )
                ) {
                  throw new Error("Enter new values");
                }
              }

              if (new Decimal(val).isZero()) {
                throw new Error("Enter your sell offer");
              }

              // if (new Decimal(val).lt(MINIMUM_MINIMA_TRADE)) {
              //   throw new Error("Minimum is " + MINIMUM_MINIMA_TRADE);
              // }

              if (new Decimal(val).decimalPlaces() > 4) {
                throw new Error("Can't exceed more than 4 decimal places");
              }

              return true;
            } catch (error) {
              // console.error(error);
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

              if (_currentOrderBook?.wminima.enable) {
                if (
                  new Decimal(val).equals(_currentOrderBook?.wminima.sell) &&
                  parent.buy &&
                  new Decimal(parent.buy).equals(
                    _currentOrderBook?.wminima.buy,
                  ) &&
                  new Decimal(parent.minimum).equals(
                    _currentOrderBook?.wminima.minimum,
                  )
                ) {
                  throw new Error("Enter new values");
                }
              }

              if (new Decimal(val).isZero()) {
                throw new Error("Enter your buy offer");
              }

              // if (new Decimal(val).lt(MINIMUM_MINIMA_TRADE)) {
              //   throw new Error("Minimum is " + MINIMUM_MINIMA_TRADE);
              // }

              if (new Decimal(val).decimalPlaces() > 4) {
                throw new Error("Can't exceed more than 4 decimal places");
              }

              return true;
            } catch (error) {
              // console.error(error);
              if (error instanceof Error) {
                return createError({
                  path,
                  message:
                    error && error.message ? error.message : "Invalid number",
                });
              }
            }
          }),
        minimum: yup
          .number()
          .required("Enter the minimum Minima trade")
          .test("valid amount", function (val) {
            const { path, createError } = this;

            try {
              const isWholeNumber = new Decimal(val).mod(1).equals(0);
              if (!isWholeNumber) {
                throw new Error(
                  "Can have only whole numbers for Minimum trades",
                );
              }

              return true;
            } catch (error) {
              // console.error(error);
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
          } ${(errors.sell || errors.buy || errors.minimum) && "outline !outline-red-300"}`}
        >
          <Toolbar token="WMINIMA" />

          <div className="grid grid-rows-[16px_1fr]">
            <div />
            <div className="px-4">
              <div className="grid grid-cols-2 bg-transparent  dark:bg-[#1B1B1B] relative divide-x-2 divide-red-300">
                <div className="relative border-l-2 border-teal-300 grid grid-cols-[1fr_auto]">
                  <div className="grid grid-cols-[1fr_auto]">
                    <div className="pl-4">
                      <label className="text-xs font-bold mb-1 text-opacity-50">
                        I want to buy 1 Minima for
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
                        src="./assets/wtoken.svg"
                      />
                    </div>
                  </div>
                </div>
                <div className="relative grid grid-cols-[1fr_auto]">
                  <div className="pl-4">
                    <label className="text-xs font-bold mb-1 text-opacity-50">
                      I want to sell 1 Minima for
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
                      src="./assets/wtoken.svg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-rows-[16px_1fr]">
            <div />
            <div className="">
              <div className="grid grid-cols-2 bg-transparent bg-gray-300 bg-opacity-10  dark:bg-black relative">
                <div className="relative grid grid-cols-[1fr_auto]">
                  <div className="text-center">
                    <div className="pl-4">
                      <label className="text-xs font-bold mb-1 text-opacity-50">
                        Minimum Minima Trade
                      </label>
                      <input
                        id="minimum"
                        name="minimum"
                        type="number"
                        onChange={handleChange}
                        onFocus={() => setF(true)}
                        onBlur={(e) => {
                          setF(false);
                          handleBlur(e);
                        }}
                        value={values.minimum}
                        className="bg-transparent w-full rounded font-mono focus:outline-none truncate text-center"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
                <div className="relative grid grid-cols-[1fr_auto]">
                  <div className="pl-4 text-center">
                    <label className="text-xs font-bold mb-1 text-opacity-50">
                      Maximum Minima Trade{" "}
                      <span className="text-yellow-600 dark:text-yellow-300 tracking-tighter">
                        (LOCKED)
                      </span>
                    </label>
                    <input
                      readOnly
                      id="sell"
                      name="sell"
                      type="number"
                      onChange={handleChange}
                      onFocus={() => setF(true)}
                      onBlur={(e) => {
                        setF(false);
                        handleBlur(e);
                      }}
                      value={values.maximum}
                      className="bg-transparent w-full font-mono rounded focus:outline-none truncate text-center text-yellow-600 dark:text-yellow-300"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4">
            {!!values.sell &&
              !!values.buy &&
              values.sell > 0 &&
              values.buy > 0 && (
                <p className="text-xs mt-4">
                  <b>Example:</b> You would receive{" "}
                  {new Decimal(100).dividedBy(values.buy).toFixed(0)}{" "}
                  <b>Minima</b> for 100 <b>WMINIMA</b> and you would receive{" "}
                  {new Decimal(100).times(values.sell).toFixed(0)}{" "}
                  <b>WMINIMA</b> for 100 <b>Minima</b>
                </p>
              )}
          </div>

          {_allowanceLock && (
            <div className="mt-4 px-4 mb-3">
              <button
                onClick={() => setPromptAllowance(true)}
                type="button"
                className="mt-4 w-full bg-violet-300 p-3 font-bold dark:text-black trailing-wider"
              >
                Approve allowances
              </button>
            </div>
          )}

          {_allowanceLock && (
            <div className="mt-4 px-4 mb-3">
              {!values.enable && (
                <button
                  type="submit"
                  disabled={!isValid}
                  className={`hover:bg-teal-600 w-full text-white bg-teal-500 dark:text-[#1B1B1B] font-bold disabled:bg-opacity-20 ${
                    (errors.sell || errors.buy || errors.minimum) &&
                    "hover:bg-red-100 bg-red-100 !text-red-300"
                  }`}
                >
                  {errors.sell && errors.buy && errors.buy}
                  {errors.sell && !errors.buy && errors.sell}
                  {!errors.sell && errors.buy && errors.buy}
                  {!errors.sell &&
                    !errors.buy &&
                    errors.minimum &&
                    errors.minimum}
                  {!errors.sell && !errors.buy && !errors.minimum && "Enable"}
                </button>
              )}

              {values.enable && (
                <div className="w-full grid grid-cols-[1fr_minmax(0,_100px)] gap-1">
                  <button
                    type="submit"
                    disabled={!isValid}
                    className={`hover:bg-teal-600 w-full text-white bg-teal-500 dark:text-[#1B1B1B] font-bold disabled:bg-opacity-20 ${
                      (errors.sell || errors.buy || errors.minimum) &&
                      "hover:bg-red-100 bg-red-100 !text-red-300"
                    }`}
                  >
                    {errors.sell && errors.buy && errors.buy}
                    {errors.sell && !errors.buy && errors.sell}
                    {!errors.sell && errors.buy && errors.buy}
                    {!errors.sell &&
                      !errors.buy &&
                      errors.minimum &&
                      errors.minimum}
                    {!errors.sell && !errors.buy && !errors.minimum && "Update"}
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
          )}
        </form>
      )}
    </Formik>
  );
};

export default WrappedPool;
