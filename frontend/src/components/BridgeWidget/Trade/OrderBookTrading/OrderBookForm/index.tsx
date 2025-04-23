import { useContext } from "react";
import TetherPool from "../Pools/TetherPool";
import { appContext } from "../../../../../AppContext";
import withConfirmation from "../Pools/withConfirmation";

import { Formik } from "formik";
import * as yup from "yup";
import Decimal from "decimal.js";
import { MAXIMUM_MINIMA_TRADE } from "../../../../../../../dapp/js/htlcvars.js";
import { useWalletContext } from "../../../../../providers/WalletProvider/WalletProvider";
import SelectFavorites from "../Pools/SelectFavorites";
import BalanceOverview from "../Pools/BalanceOverview/index.js";

// const WrappedPoolWithConfirmation = withConfirmation(WrappedPool, "wminima");
const TetherPoolWithConfirmation = withConfirmation(TetherPool, "usdt");

const OrderBookForm = () => {
  const { handleActionViaBackend, notify } = useContext(appContext);
  const { callBalanceForApp } = useWalletContext();


  return (
    <div>
      <Formik
        initialValues={{ native: "", favorites: false, transaction: "" }}
        validationSchema={yup.object().shape({
          native: yup
            .string()
            .matches(/^\d*\.?\d+$/, "Enter a valid amount")
            .required("Enter your offer")
            .test("valid amount", function (val) {
              const { path, createError } = this;

              try {
                if (new Decimal(val).isZero()) {
                  throw new Error("Enter your offer");
                }

                if (new Decimal(val).decimalPlaces() > 4) {
                  throw new Error("Can't exceed more than 4 decimal places");
                }

                if (new Decimal(val).greaterThan(MAXIMUM_MINIMA_TRADE)) {
                  throw new Error(
                    "Order too big, must be less than " + MAXIMUM_MINIMA_TRADE
                  );
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
        onSubmit={async ({ transaction }, { resetForm }) => {
          // do something..
          try {
            if (!transaction) {
              throw new Error("Transaction payload not available");
            }

            await handleActionViaBackend(transaction);

            notify("Order requested...");
            resetForm();

            callBalanceForApp();
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
      >
        {({ submitForm }) => (
          <>
            <div className="flex justify-end px-1 my-2">
              <SelectFavorites />
            </div>            
            <TetherPoolWithConfirmation onSubmit={() => submitForm()} />
          </>
        )}
      </Formik>

      <BalanceOverview />

    </div>
  );
};

export default OrderBookForm;
