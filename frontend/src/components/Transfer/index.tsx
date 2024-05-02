import {  parseUnits } from "ethers";
import { Formik } from "formik";
import { useContext, useState } from "react";
import * as yup from "yup";
import ProgressIcon from "../UI/Progress";
import SelectAsset from "../SelectAsset";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { appContext } from "../../AppContext";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { _defaults } from "../../constants";
import { Wallet } from "ethers";
import Decimal from "decimal.js";

type FormState = {
  type: "native" | "erc20";
  submitForm: (values: any) => any;
  onCancel: () => void;
};
const Transfer = ({ type, submitForm, onCancel }: FormState) => {
  const { _balance } = useWalletContext();
  const { _currentNetwork, _defaultNetworks, _minimaBalance } = useContext(appContext);
  const { _network } = useWalletContext();
  const { tokens } = useTokenStoreContext();

  const [_, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);

  const initialTokenShouldBeMinimaIfExists = tokens.find(
    (token) => token.address === _defaults["wMinima"][_network]
  );

  return (
    <Formik
      initialValues={{
        amount: "",
        asset:
          type === "erc20"
            ? initialTokenShouldBeMinimaIfExists
              ? initialTokenShouldBeMinimaIfExists
              : {
                  name: _defaultNetworks[_currentNetwork].name,
                  symbol: _defaultNetworks[_currentNetwork].symbol,
                  balance: _balance,
                  address: "",
                  type: "ether",
                }
            : {},
        address: "",
        receipt: null,
        gasPaid: "",
      }}
      validationSchema={yup.object().shape({
        amount: yup
          .string()
          .matches(/^\d*\.?\d+$/, "Enter a valid number.")
          .required("Amount is required")
          .test("has funds", function (val) {
            const { path, createError, parent } = this;

            try {
              if (type === "erc20") {
                if (
                  parent.asset.type === "ether" &&
                  (new Decimal(val).gt(_balance) || new Decimal(val).isZero())
                  // || transactionTotal && new Decimal(transactionTotal!).gt(_wrappedMinimaBalance)
                ) {
                  throw new Error();
                }
                
                const assetBalance = parent.asset.balance;
                // TO-DO
                const decimals = parent.asset.name === 'Tether' ? 6 : 18;
                if (
                  parent.asset.type === "erc20" &&
                  (new Decimal(parseUnits(val, decimals).toString()).gt(assetBalance) ||
                    new Decimal(assetBalance).isZero())
                  // || transactionTotal && new Decimal(transactionTotal!).gt(_wrappedMinimaBalance)
                ) {
                  throw new Error();
                }
              }
              if (type === 'native') {
                if (new Decimal(val).gt(_minimaBalance.confirmed)) {
                  throw new Error();
                }
              }


              return true;
            } catch (error) {
              return createError({
                path,
                message: "Insufficient funds",
              });
            }
          }),
      })}
      onSubmit={async (
        { amount, asset },
        { setStatus, resetForm }
      ) => {
        setError(false);
        setLoading(true);
        setStatus(undefined);
        try {
          let action;
          let address;

          if (type === "erc20") {
            if (asset.name === "wMinima") {
              action = "SENDWMINIMA";
            } else if (asset.name === "Ethereum") {
              action = "SENDETH";
            } else if (asset.name === "Tether") {
              action = "SENDUSDT";
            }

            await new Promise((resolve, reject) => {
              (window as any).MDS.cmd(
                "seedrandom modifier:ghost",
                async (resp) => {
                  try {
                    const genKey = resp.response.seedrandom;
                    address = await new Wallet(genKey).getAddress();
                    resolve(true);
                  } catch (error) {
                    reject(error);
                  }
                }
              );
            });
          }

          await submitForm(
            type === "native" ? amount : { amount, action, address }
          );
          resetForm();
          setStatus("Successful");
        } catch (error: any) {
          console.error(error);
          // display error message
          setStep(4);
          setError(
            error && error.shortMessage
              ? error.shortMessage
              : typeof error === "string"
              ? error
              : "Transaction failed, please try again."
          );
        } finally {
          setLoading(false);
        }
      }}
    >
      {({
        handleSubmit,
        isSubmitting,
        getFieldProps,
        touched,
        errors,
        isValid,
        dirty,
        status,
      }) => (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">{type === "erc20" && <SelectAsset />}</div>
          <div>
            <div className="flex items-center space-x-2">
              <input
                disabled={isSubmitting}
                required
                {...getFieldProps("amount")}
                type="text"
                autoFocus
                placeholder="Amount"
                className={`focus:outline-violet-600 disabled:bg-opacity-10 font-mono bg-black dark:bg-white focus:placeholder:text-black focus:bg-white placeholder:text-white text-white dark:text-black focus:text-black dark:placeholder:text-black focus:font-extralight font-bold w-full py-3 rounded-lg px-4 ${
                  touched.amount && errors.amount
                    ? "!border-4 !outline-none !border-red-500"
                    : ""
                }`}
              />
              {/* <span className="border text-center border-slate-700 text-sm font-bold border-l-0 border-r-0 py-2 px-3">
                {values !== null ? values.asset.symbol : values}
                <button
                  onClick={() =>
                    setFieldValue(
                      "amount",
                      values.asset.type !== "erc20"
                        ? values.asset.balance
                        : formatEther(values.asset.balance)
                    )
                  }
                  type="button"
                  className="p-0 text-black border-slate-600 dark:text-white w-full bg-transparent border text-sm dark:border-teal-300 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black"
                >
                  Max
                </button>
              </span> */}
            </div>

            {errors.amount && (
              <div className="mb-2 bg-red-500 text-white rounded px-4 py-1 my-2">
                {errors.amount}
              </div>
            )}
          </div>

          {status && (
            <div className="text-center my-2 bg-teal-500 p-2 rounded">
              <h6 className="font-bold text-teal-800 dark:text-black">
                Withdrawal Successful
              </h6>
            </div>
          )}

          {error && (
            <div className="text-center my-2 bg-red-500 p-2 rounded">
              <h6 className="font-bold text-white dark:text-black">
                Withdrawal Failed!
              </h6>
              <p className="text-white dark:text-black">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 my-4">
            <div />
            <div
              className={`gap-1 grid ${
                loading ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {loading && <div />}
              {!loading && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="bg-gray-500 text-white dark:text-black font-bold"
                >
                  Cancel
                </button>
              )}
              <button
                disabled={loading || !isValid || !dirty}
                type="submit"
                className="bg-orange-600 font-bold flex justify-center text-white dark:text-black disabled:bg-opacity-50"
              >
                {!loading && "Withdraw"}
                {loading && <ProgressIcon />}
              </button>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default Transfer;
