import { Formik } from "formik";
import Navigation from "../Navigation/index.js";
import { useContext, useEffect, useState } from "react";
import OrderPrice from "../OrderPrice/index.js";
import * as yup from "yup";
import Decimal from "decimal.js";
import { appContext } from "../../../../../../AppContext.js";
import { useTokenStoreContext } from "../../../../../../providers/TokenStoreProvider/index.js";
import { formatUnits } from "ethers";

import { searchAllorFavsOrderBooks } from "../../../../../../../../dapp/js/orderbookutil.js";
import { _defaults } from "../../../../../../constants/index.js";
import { useWalletContext } from "../../../../../../providers/WalletProvider/WalletProvider.js";

import {
  MAXIMUM_MINIMA_TRADE,
} from "../../../../../../../../dapp/js/htlcvars.js";
import { Data } from "../../../../../../types/Order.js";
import Toolbar from "../Toolbar/index.js";
import Charts from "../../Charts/index.js";
import PricePerToken from "../PricePerToken/index.js";
import WidgetInputWrapper from "../../../../../UI/FormComponents/WidgetInputWrapper/index.js";
import WrappedToken from "./WrappedToken/index.js";

const WrappedPoolOld = () => {
  const [_currentNavigation, setCurrentNavigation] = useState("Buy");
  const [_f, setF] = useState(false);

  const { _minimaBalance, _userDetails, notify, handleActionViaBackend, setTriggerBalanceUpdate } =
    useContext(appContext);
  const { tokens } = useTokenStoreContext();
  const { _network, getEthereumBalance } = useWalletContext();
  const relevantToken = tokens.find((t) => t.name === "wMinima");

  const handlePullBalance = async () => {
    // Pause for 3 seconds
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
  
    // Trigger balance update
    setTriggerBalanceUpdate(true);
    getEthereumBalance();
  
    // Pause for 2 seconds before setting the trigger back to false
    setTimeout(() => {
      setTriggerBalanceUpdate(false);
    }, 2000);
  }

  useEffect(() => {

    (async () => {
      await handlePullBalance();
    })()

  }, []);

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
        const { offerPrice, order, orderPrice } = formData;

        try {
          if (!order) {
            return setFieldError("matchingOrder", "No matching order");
          }
          let message = {};
          const ERC20Contract =
            "0x" + _defaults["wMinima"][_network].slice(2).toUpperCase();

          if (_currentNavigation === "Buy") {
            message = {
              action: "STARTETHSWAP",
              reqpublickey: (order as Data).ethpublickey,
              erc20contract: ERC20Contract,
              reqamount: orderPrice,
              amount: offerPrice,
            };
          } else {
            message = {
              action: "STARTMINIMASWAP",
              reqpublickey: (order as Data).publickey,
              contractaddress: "ETH:" + ERC20Contract,
              requestamount: orderPrice,
              sendamount: offerPrice,
            };
          }

          await handleActionViaBackend(message);

          notify("Order requested...");
          resetForm();

          await handlePullBalance();
        } catch (error: any) {
          console.error(error);
          if (error instanceof Error) {
            return notify("Error : " + error.message);
          }

          notify(
            error.message ? error.message : "Error, something went wrong!"
          );
        }
      }}
      validationSchema={yup.object().shape({
        offerPrice: yup
          .string()
          .matches(/^\d*\.?\d+$/, "Enter a valid amount")
          .required("Enter your offer")
          .test("valid amount", function (val) {
            const { path, createError, parent } = this;

            try {
              if (new Decimal(val).isZero()) {
                throw new Error("Enter your offer");
              }

              // if (new Decimal(val).lt(parent.order.wminima.minimum)) {
              //   throw new Error("Minimum order is "+parent.order.wminima.minimum+" MINIMA");
              // }

              if (new Decimal(val).gt(MAXIMUM_MINIMA_TRADE)) {
                throw new Error("Exceeds maximum order of "+MAXIMUM_MINIMA_TRADE+" MINIMA");
              }
              
              if (new Decimal(val).gt(_minimaBalance.confirmed)) {
                throw new Error("Insufficient funds");
              }

              if (new Decimal(val).decimalPlaces() > 4) {
                throw new Error("Can't exceed more than 4 decimal places");
              }


              if (_currentNavigation === 'Buy') {
                const balance = formatUnits(
                  relevantToken!.balance,
                  relevantToken!.decimals
                ).toString();
                if (new Decimal(parent.orderPrice).gt(balance)) {
                  throw new Error("Insufficient funds");
                }                            
              }                        

              if (new Decimal(parent.orderPrice).isZero()) {
                throw new Error("Order unavailable");
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
              <div className="flex flex-end justify-end px-6 text-gray-100">
                <PricePerToken
                  order={values.order}
                  tradingSide={_currentNavigation}
                  token="wminima"
                />
              </div>

              <WidgetInputWrapper
                tradeSide={_currentNavigation.toLowerCase() as 'buy'|'sell'}
                value={values.offerPrice}
                errors={
                  !!(
                    errors.offerPrice &&
                    !errors.offerPrice.includes("Insufficient")
                  )
                }
                tokenComponent={<WrappedToken />}
                calculatedOrderComponent={
                  <OrderPrice orderType={_currentNavigation} token="wminima" />
                }
                setFocus={setF}
                handleBlur={handleBlur}
                handleChange={handleChange}
              />
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

export default WrappedPoolOld;
