import { Formik } from "formik";
import Navigation from "../Navigation";
import { useContext, useState } from "react";
import OrderPrice from "../OrderPrice";
import * as yup from "yup";
import Decimal from "decimal.js";
import { appContext } from "../../../../../../AppContext";
import { useTokenStoreContext } from "../../../../../../providers/TokenStoreProvider";
import { formatUnits } from "ethers";

import { searchAllorFavsOrderBooks } from "../../../../../../../../dapp/js/orderbookutil.js";
import { _defaults } from "../../../../../../constants";
import { useWalletContext } from "../../../../../../providers/WalletProvider/WalletProvider";

import { calculateAmount } from "../../../../../../../../dapp/js/orderbookutil.js";
import {
  MINIMUM_MINIMA_TRADE,
  MAXIMUM_MINIMA_TRADE,
} from "../../../../../../../../dapp/js/htlcvars.js";
import { Data } from "../../../../../../types/Order.js";
import Toolbar from "../Toolbar/index.js";
import Charts from "../../Charts/index.js";

const WrappedPool = () => {
  const [_currentNavigation, setCurrentNavigation] = useState("Buy");
  const [_f, setF] = useState(false);

  const { _minimaBalance, _userDetails, notify, handleActionViaBackend } =
    useContext(appContext);
  const { tokens } = useTokenStoreContext();
  const { _network } = useWalletContext();
  const relevantToken = tokens.find((t) => t.name === "wMinima");

  return (
    <Formik
      initialValues={{
        offerPrice: 0,
        orderPrice: 0,
        matchingOrder: false,
        order: null,
        price: null,
        favorites: false,
      }}
      onSubmit={async (formData, { setFieldError, resetForm }) => {
        const { offerPrice, order } = formData;

        try {
          if (!order) {
            return setFieldError("matchingOrder", "No matching order");
          }

          const ERC20Contract =
            "0x" + _defaults["wMinima"][_network].slice(2).toUpperCase();
          const message = {
            action: "STARTETHSWAP",
            reqpublickey: (order as Data).ethpublickey,
            erc20contract: ERC20Contract,
            reqamount: calculateAmount(
              _currentNavigation.toLowerCase(),
              offerPrice,
              "wminima",
              (order as Data).orderbook
            ),
            amount: offerPrice,
          };

          await handleActionViaBackend(message);

          notify("Executed a swap!");
          resetForm();

          // console.log("transaction response", res);
        } catch (error: any) {
          console.error(error);
          if (error instanceof Error) {
            return notify("Error : "+ error.message);
          }

          notify(error.message ? error.message : "Error, something went wrong!");
        }
      }}
      validationSchema={yup.object().shape({
        offerPrice: yup
          .string()
          .matches(/^\d*\.?\d+$/, "Enter a valid amount")
          .required("Enter your offer")
          .test("valid amount", function (val) {
            const { path, createError } = this;

            try {
              if (new Decimal(val).isZero()) {
                throw new Error("Enter your offer");
              }

              if (new Decimal(val).gt(MAXIMUM_MINIMA_TRADE)) {
                throw new Error("Exceeds max trade of " + MAXIMUM_MINIMA_TRADE);
              }

              if (new Decimal(val).lt(MINIMUM_MINIMA_TRADE)) {
                throw new Error("Minimum order is " + MINIMUM_MINIMA_TRADE);
              }

              if (_currentNavigation === "Sell") {
                if (new Decimal(val).gt(_minimaBalance.confirmed)) {
                  throw new Error("Insufficient funds");
                }
              } else {
                const balance = formatUnits(
                  relevantToken!.balance,
                  relevantToken!.decimals
                ).toString();
                if (new Decimal(val).gt(balance)) {
                  throw new Error("Insufficient funds");
                }
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
        orderPrice: yup
          .string()
          .matches(/^\d*\.?\d+$/, "Enter a valid amount")
          .required("Enter your offer"),
        matchingOrder: yup
          .boolean()
          // @ts-ignore
          .test("has matching order..", async function (val) {
            const { path, createError, parent } = this;
            const { offerPrice, favorites } = parent;

            try {
              const result = await new Promise((resolve, reject) => {
                searchAllorFavsOrderBooks(
                  favorites,
                  _currentNavigation.toLowerCase(),
                  offerPrice,
                  "wminima",
                  _userDetails.minimapublickey,
                  function (found) {
                    if (found) {
                      resolve(true); // Resolve the Promise if a matching order is found
                    } else {
                      reject(false);
                    }
                  }
                );
              });
              return result; // Return the result of the Promise
            } catch (error) {
              return createError({ path, message: "No matching order" }); // Return false if an error occurs during validation
            }
          }),
      })}
    >
      {({
        handleSubmit,
        handleBlur,
        handleChange,
        isValid,
        errors,
        values,
      }) => (
        <>
          <form
            className={`shadow-sm dark:shadow-none dark:bg-[#1B1B1B] rounded ${
              _f && "outline dark:outline-yellow-300"
            } ${errors.matchingOrder && "!outline outline-blue-300"} ${
              errors.offerPrice && "!outline !outline-red-300"
            } `}
            onSubmit={handleSubmit}
          >
            <Toolbar />

            <div className="mb-4">
              <Charts
                fav={values.favorites}
                book="wminima"
                type={_currentNavigation.toLowerCase()}
              />
            </div>

            <div className="py-2 px-4">
              <Navigation
                navigation={["Buy", "Sell"]}
                _currentNavigation={_currentNavigation}
                setCurrentNavigation={setCurrentNavigation}
              />
            </div>

            <div className="grid grid-rows-[16px_1fr]">
              <div className="flex flex-end justify-end px-8 text-gray-100">
                <span className="text-xs text-black dark:text-gray-100 dark:text-opacity-50">
                  {values.order &&
                  (values.order as Data).orderbook &&
                  (values.order as Data).orderbook.wminima
                    ? "x" +
                      (values.order as Data).orderbook.wminima[
                        _currentNavigation === "Buy" ? "sell" : "buy"
                      ] +
                      " each"
                    : null}
                </span>
              </div>
              <div className="grid grid-cols-2 divide-x-2 divide-teal-300 px-4">
                <div className="px-4 border-l-2 border-red-300">
                  <div className="grid grid-cols-[1fr_36px]">
                    <div
                      className={`${
                        errors.offerPrice &&
                        !errors.offerPrice.includes("Insufficient") &&
                        "animate-pulse"
                      }`}
                    >
                      <label className="text-xs font-bold dark:text-gray-100 dark:text-opacity-30">
                        I will give
                      </label>
                      <input
                        onFocus={() => {
                          setF(true);
                        }}
                        onBlur={(e) => {
                          setF(false);
                          handleBlur(e);
                        }}
                        id="offerPrice"
                        name="offerPrice"
                        onChange={handleChange}
                        value={values.offerPrice}
                        className="w-full bg-transparent focus:outline-none font-mono"
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <img
                        alt="token"
                        src={
                          _currentNavigation === "Buy"
                            ? "./assets/wtoken.svg"
                            : "./assets/token.svg"
                        }
                        className="rounded-full w-[36px] h-[36px] my-auto"
                      />
                      <p className="text-xs text-center font-bold font-mono truncate">
                        {_currentNavigation === "Sell" &&
                          _minimaBalance &&
                          new Decimal(_minimaBalance.confirmed).toFixed(0)}
                        {_currentNavigation === "Buy" &&
                          relevantToken &&
                          new Decimal(
                            formatUnits(
                              relevantToken!.balance,
                              relevantToken!.decimals
                            )
                          ).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-4">
                  <div className="grid grid-cols-[1fr_36px]">
                    <div>
                      <label className="text-xs font-bold dark:text-gray-100 dark:text-opacity-30">
                        I will receive
                      </label>

                      <OrderPrice
                        orderType={_currentNavigation}
                        token="wminima"
                        userPublicKey={_userDetails.publickey}
                      />
                    </div>
                    <div>
                      <img
                        alt="token"
                        src={
                          _currentNavigation === "Sell"
                            ? "./assets/wtoken.svg"
                            : "./assets/token.svg"
                        }
                        className="rounded-full w-[36px] h-[36px] my-auto"
                      />
                      <p className="text-xs text-center font-bold font-mono truncate">
                        {_currentNavigation === "Buy" &&
                          _minimaBalance &&
                          new Decimal(_minimaBalance.confirmed).toFixed(0)}
                        {_currentNavigation === "Sell" &&
                          relevantToken &&
                          new Decimal(
                            formatUnits(
                              relevantToken!.balance,
                              relevantToken!.decimals
                            )
                          ).toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 pb-3">
              <button
                disabled={!isValid}
                type="submit"
                className="mt-4 w-full bg-black py-3 text-white dark:bg-orange-600 font-bold disabled:text-red-300 dark:text-black disabled:bg-gray-100 dark:disabled:bg-gray-100 dark:disabled:bg-opacity-5"
              >
                {isValid && "Swap"}
                {!isValid && errors.offerPrice
                  ? errors.offerPrice
                  : errors && errors.matchingOrder
                  ? errors.matchingOrder
                  : null}
              </button>
            </div>
          </form>
        </>
      )}
    </Formik>
  );
};

export default WrappedPool;
