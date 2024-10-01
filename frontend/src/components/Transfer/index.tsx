import { getAddress, parseUnits } from "ethers";
import { Formik } from "formik";
import { useContext, useEffect, useRef, useState } from "react";
import * as yup from "yup";
import ProgressIcon from "../UI/Progress";
import SelectAsset from "../SelectAsset";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";
import { appContext } from "../../AppContext";
import { useTokenStoreContext } from "../../providers/TokenStoreProvider";
import { _defaults } from "../../constants";
import { Wallet } from "ethers";
import Decimal from "decimal.js";
import { primaryButtonStyle } from "../../styles";

type FormState = {
  type: "native" | "erc20";
  submitForm: (values: any) => any;
};
const Transfer = ({ type, submitForm }: FormState) => {
  const {
    _mainBalance,
    _currentNetwork,
    _defaultNetworks,
    _minimaBalance,
    getWalletBalance,
    getMainMinimaBalance,
    notify,
  } = useContext(appContext);
  const { _network, callBalanceForApp, _balance} = useWalletContext();
  const { tokens } = useTokenStoreContext();

  const [ethWalletAddress, setEthWalletAddress] = useState("");

  const [f, setF] = useState({ amount: false, address: false });

  const [_, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);

  const initialTokenShouldBeMinimaIfExists = tokens.find(
    (token) => token.address === _defaults["wMinima"][_network]
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const getBalances = async () => {
    // Call getWalletBalance and getMainMinimaBalance immediately
    await getWalletBalance();
    await getMainMinimaBalance();

    // Counter to track how many times getWalletBalance has been called
    let callCount = 1;

    // Set an interval to call getWalletBalance every 15 seconds
    intervalRef.current = setInterval(async () => {
      if (callCount < 3) {
        await getWalletBalance(); // Call getWalletBalance again
        callCount++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current); // Stop the interval after 3 calls
          intervalRef.current = null; // Reset the intervalRef to null
        }
      }
    }, 15000); // 15 seconds interval
  };

  useEffect(() => {
    if (type === "erc20") {
      (async () => {
        (window as any).MDS.cmd("seedrandom modifier:ghost", async (resp) => {
          try {
            const genKey = resp.response.seedrandom;
            const _address = await new Wallet(genKey).getAddress();
            setEthWalletAddress(_address);
          } catch (error) {
            console.error("Failed to gen eth wallet", error);
          }
        });
      })();
    }
  }, [type]);

  const mainWalletBalance =
    _mainBalance && _mainBalance.unconfirmed === "0"
      ? new Decimal(_mainBalance.sendable).toFixed(1)
      : _mainBalance && _mainBalance.unconfirmed !== "0"
      ? new Decimal(_mainBalance.sendable).toFixed(1) +
        "/" +
        new Decimal(_mainBalance.unconfirmed).toString()
      : "-";

  return (
    <div className="bg-violet-50 p-6 rounded-md">
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
          address: ethWalletAddress,
          receipt: null,
          gasPaid: "",
        }}
        validationSchema={yup.object().shape({
          amount: yup
            .number()
            .required("Amount is required")
            .test("has funds", function (val) {
              const { path, createError, parent } = this;

              try {
                if (new Decimal(val).isZero()) {
                  throw new Error("Please enter a valid amount");
                }

                if (type === "erc20") {
                  if (
                    parent.asset.type === "ether" &&
                    (new Decimal(val).gt(_balance) || new Decimal(val).isZero())
                    // || transactionTotal && new Decimal(transactionTotal!).gt(_wrappedMinimaBalance)
                  ) {
                    throw new Error("Insufficient funds");
                  }

                  const assetBalance = parent.asset.balance;
                  // TO-DO
                  const decimals = parent.asset.name === "Tether" ? 6 : 18;
                  if (
                    parent.asset.type === "erc20" &&
                    (new Decimal(parseUnits(val, decimals).toString()).gt(
                      assetBalance
                    ) ||
                      new Decimal(assetBalance).isZero())
                    // || transactionTotal && new Decimal(transactionTotal!).gt(_wrappedMinimaBalance)
                  ) {
                    throw new Error("Insufficient funds");
                  }
                }
                if (type === "native") {
                  if (new Decimal(val).gt(_minimaBalance.confirmed)) {
                    throw new Error("Insufficient funds");
                  }
                }

                return true;
              } catch (error) {
                if (error instanceof Error) {
                  return createError({
                    path,
                    message: error.message,
                  });
                }

                return createError({
                  path,
                  message: "Something went wrong, try again in a few",
                });
              }
            }),
          address: yup.string().test("valid address", function (val) {
            const { path, createError } = this;

            try {
              if (type === "erc20") {
                if (!val) {
                  return true;
                }

                getAddress(val);
              }

              return true;
            } catch (error) {
              if (error instanceof Error) {
                return createError({
                  path,
                  message: "Invalid Ethereum address",
                });
              }

              return createError({
                path,
                message: "Something went wrong, try again in a few",
              });
            }
          }),
        })}
        onSubmit={async ({ amount, asset, address }, { resetForm }) => {
          setError(false);
          setLoading(true);
          try {
            let action;

            if (type === "erc20") {
              if (asset.name === "wMinima") {
                action = "SENDWMINIMA";
              } else if (
                asset.name === "Ethereum" ||
                asset.name === "SepoliaETH"
              ) {
                action = "SENDETH";
              } else if (asset.name === "Tether") {
                action = "SENDUSDT";
              }

              if (!address.length && !ethWalletAddress.length) {
                throw new Error("Please enter an address");
              }
            }

            await submitForm(
              type === "native"
                ? amount
                : {
                    amount,
                    action,
                    address: address.length ? address : ethWalletAddress,
                  }
            );

            notify(
              `Your withdrawal of ${amount} ${
                type === "native" ? "MINIMA" : asset.name
              } from the Swap Wallet is on the way!`
            );

            if (type === "native") {
              await getBalances();
            } else {
              callBalanceForApp();
            }

            resetForm();
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

            await new Promise((resolve) => setTimeout(resolve, 3000));
            setError(false);
          }
        }}
      >
        {({
          handleSubmit,
          handleChange,
          handleBlur,
          isSubmitting,
          values,
          errors,
          isValid,
          dirty,
          setFieldValue,
        }) => (
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-100 max-w-sm mx-auto space-y-4"
          >
            {type === "erc20" && (
              <>
                <SelectAsset />
              </>
            )}

            {type === "native" && (
              <div className="bg-purple-100 text-purple-800 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium">Main Wallet Balance:</p>
                <p className="text-2xl font-bold break-all">
                  {mainWalletBalance} MINIMA
                </p>
              </div>
            )}
            <div className="bg-white border border-purple-200 flex rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
              <input
                disabled={isSubmitting}
                onBlur={(e) => {
                  handleBlur(e);
                  setF((prevState) => ({ ...prevState, ["amount"]: false }));
                }}
                id="amount"
                name="amount"
                onChange={handleChange}
                value={values.amount}
                onFocus={() =>
                  setF((prevState) => ({ ...prevState, ["amount"]: true }))
                }
                required
                type="number"
                step="any"
                autoFocus={false}
                placeholder="Amount"
                className="bg-transparent truncate focus:outline-none placeholder:text-purple-300 text-purple-800 font-bold w-full py-3 px-4"
              />
              <div className="h-full my-auto pr-2">
                <button
                  onClick={() => {
                    if (type === "native" && _minimaBalance) {
                      setFieldValue("amount", _minimaBalance.confirmed);
                    }
                    
                    if (type === "erc20" && tokens) {
                      if (values.asset.type === "ether") {
                        return setFieldValue("amount", _balance);                        
                      }
                      
                      const selectedToken = tokens.find(token => token.name === values.asset.name);
                      
                      if (selectedToken) {
                        const parsedBalance = parseUnits(selectedToken.balance, selectedToken.decimals);
                        setFieldValue("amount", parsedBalance.toString());
                      } else {
                        console.error(`Token ${values.asset.name} not found in the tokens array`);
                        setFieldValue("amount", "0");
                      }
                    }
                  }}
                  type="button"
                  className={`bg-transparent text-purple-600 ${
                    f ? "text-purple-800" : ""
                  } focus:outline-none font-bold tracking-tighter px-2 py-1 rounded transition-colors duration-200 hover:bg-purple-100`}
                >
                  Max
                </button>
              </div>
            </div>

            {errors.amount && (
              <div className="bg-red-50 border-red-500 px-4 py-2 my-4 rounded-r-lg flex items-start space-x-3">
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold text-lg flex items-center">
                    <span>{errors.amount}</span>
                  </h3>
                </div>
              </div>
            )}

            {type === "erc20" && (
              <>
                <div className="bg-white border border-purple-200 flex rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
                  <input
                    disabled={isSubmitting}
                    onBlur={(e) => {
                      handleBlur(e);
                      setF((prevState) => ({
                        ...prevState,
                        ["address"]: false,
                      }));
                    }}
                    id="address"
                    name="address"
                    onChange={handleChange}
                    value={values.address}
                    onFocus={() =>
                      setF((prevState) => ({ ...prevState, ["address"]: true }))
                    }
                    type="text"
                    placeholder="Ethereum Address"
                    className="bg-transparent truncate focus:outline-none placeholder:text-purple-300 text-purple-800 font-bold w-full py-3 px-4"
                  />
                  <div className="h-full my-auto pr-2">
                    {ethWalletAddress &&
                      values.address !== ethWalletAddress && (
                        <button
                          onClick={() => {
                            setFieldValue("address", ethWalletAddress);
                          }}
                          type="button"
                          className={`bg-transparent text-purple-600 ${
                            f ? "text-purple-800" : ""
                          } focus:outline-none font-bold tracking-tighter px-2 py-1 rounded transition-colors duration-200 hover:bg-purple-100`}
                        >
                          EthWallet
                        </button>
                      )}
                  </div>
                </div>{" "}
                {errors.address && (
                  <div className="bg-red-50 border-red-500 px-4 py-2 my-4 rounded-r-lg flex items-start space-x-3">
                    <div className="flex-1">
                      <h3 className="text-red-800 font-semibold text-lg flex items-center">
                        <span>{errors.address}</span>
                      </h3>
                    </div>
                  </div>
                )}{" "}
              </>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded-r-lg flex items-start space-x-3">
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold text-lg flex items-center">
                    <span>Withdrawal Failed</span>
                  </h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div>
              <button
                disabled={loading || !isValid || !dirty}
                type="submit"
                className={primaryButtonStyle}
              >
                {!loading ? (
                  "Withdraw"
                ) : (
                  <span className="flex justify-center">
                    <ProgressIcon />
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default Transfer;
