import { useContext, useEffect, useState } from "react";
import { appContext } from "../../../AppContext";
import ProgressIcon from "../../UI/Progress";
import { Formik } from "formik";
import * as yup from "yup";
import Decimal from "decimal.js";
import NativeMinima from "../../NativeMinima";
import { dismissButtonStyle } from "../../../styles";

const NativeAddress = () => {
  const {
    _userDetails,
    getMainMinimaBalance,
    getWalletBalance,
    _mainBalance,
    promptDeposit,
    notify,
  } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [f, setF] = useState(false);

  useEffect(() => {
    getMainMinimaBalance();
  }, []);

  const getBalances = async () => {
    // Wait a few secs
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });

    getWalletBalance();
    getMainMinimaBalance();
  };

  if (_userDetails === null) {
    return <ProgressIcon />;
  }
  return (
    <div className="my-4">
      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <Formik
          initialValues={{ amount: 0 }}
          onSubmit={async ({ amount }, { setStatus, resetForm }) => {
            setLoading(true);
            setStatus(undefined);
            try {
              await new Promise((resolve, reject) => {
                (window as any).MDS.cmd(
                  `send amount:${amount} split:10 address:${_userDetails.minimaaddress.mxaddress}`,
                  (resp) => {
                    if (!resp.status)
                      reject(
                        resp.error
                          ? resp.error
                          : resp.message
                            ? resp.message
                            : "Failed, please try again later",
                      );

                    resolve(resp.status);
                  },
                );
              });

              setStatus("Withdrawal successful");
              resetForm();
              promptDeposit();
              notify(
                "Deposit of " +
                  amount +
                  " MINIMA to the Swap Wallet on the way",
              );
              await getBalances();
            } catch (error) {
              if (error instanceof Error) {
                return setError(error.message);
              }

              setError("Failed, please try again later");
            } finally {
              setLoading(false);
            }
          }}
          validationSchema={yup.object().shape({
            amount: yup
              .string()
              .matches(/^\d*\.?\d+$/, "Enter a valid number.")
              .required("Enter an amount")
              .test("has funds", function (val) {
                const { path, createError } = this;

                try {
                  if (_mainBalance === null) {
                    throw new Error("Balance not available...");
                  }

                  if (new Decimal(val).isZero()) {
                    throw new Error("Enter an amount");
                  }

                  if (new Decimal(val).gt(_mainBalance.sendable)) {
                    throw new Error("Insufficient funds");
                  }

                  return true;
                } catch (error) {
                  if (error instanceof Error) {
                    return createError({
                      path,
                      message: error.message,
                    });
                  }

                  createError({ path, message: "Unavailable" });
                }
              }),
          })}
        >
          {({
            handleSubmit,
            handleBlur,
            handleChange,
            setFieldValue,
            resetForm,
            values,
            isSubmitting,
            touched,
            errors,
            status,
            isValid,
            dirty,
          }) => (
            <form onSubmit={handleSubmit}>
              <p className="text-xs text-center font-bold mb-4">
                Main Minima Wallet Balance
              </p>
              <p className="text-sm mb-2">
                Enter an amount to deposit into your Swap Wallet.
              </p>
              {_mainBalance !== null && (
                <NativeMinima
                  display={false}
                  external={
                    _mainBalance.unconfirmed != "0"
                      ? _mainBalance.sendable + "/" + _mainBalance.unconfirmed
                      : _mainBalance.sendable
                  }
                />
              )}
              <div
                className={`flex space-x-2 bg-black dark:outline-gray-100 dark:outline ${
                  f && "!bg-white"
                } rounded ${f && "outline outline-violet-300"} ${
                  touched.amount && errors.amount
                    ? "!border-4 !outline-none !border-violet-500"
                    : ""
                }`}
              >
                <input
                  disabled={isSubmitting}
                  onBlur={(e) => {
                    handleBlur(e);
                    setF(false);
                  }}
                  id="amount"
                  name="amount"
                  onChange={handleChange}
                  value={values.amount}
                  onFocus={() => setF(true)}
                  required
                  type="text"
                  autoFocus={false}
                  placeholder="Amount"
                  className={`bg-transparent truncate focus:outline-none focus:placeholder:text-black focus:bg-white placeholder:text-white text-white dark:text-white focus:text-black font-bold w-full py-3 rounded-lg px-4 dark:placeholder:text-white dark:focus:text-black`}
                />
                <div className="h-full my-auto">
                  <button
                    onClick={() =>
                      setFieldValue(
                        "amount",
                        _mainBalance !== null ? _mainBalance.sendable : 0,
                      )
                    }
                    type="button"
                    className={`bg-transparent text-violet-300 ${
                      f && "text-violet-500"
                    } focus:outline-none font-bold tracking-tighter`}
                  >
                    Max
                  </button>
                </div>
              </div>

              {errors.amount && (
                <div className="p-2 text-sm px-4 bg-violet-500 text-white dark:text-black font-bold rounded-lg mt-3 mb-2">
                  {errors.amount}
                </div>
              )}

              {status && (
                <div className="text-center my-2 bg-teal-500 p-2 rounded">
                  <h6 className="font-bold text-teal-800 dark:text-black">
                    Deposit successful, please wait until your transaction is
                    confirmed
                  </h6>
                </div>
              )}

              {error && (
                <div className="text-center my-2 bg-red-500 p-2 rounded">
                  <h6 className="font-bold text-white dark:text-black">
                    Deposit Failed!
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
                      onClick={() => {
                        resetForm();
                        promptDeposit();
                      }}
                      className={dismissButtonStyle}
                    >
                      Close
                    </button>
                  )}
                  <button
                    disabled={loading || !isValid || !dirty}
                    type="submit"
                    className="bg-orange-600 font-bold flex justify-center text-white dark:text-black disabled:bg-opacity-50"
                  >
                    {!loading && "Deposit"}
                    {loading && <ProgressIcon />}
                  </button>
                </div>
              </div>
            </form>
          )}
        </Formik>
        {/* {_userDetails &&
            _userDetails.minimaaddress &&
            typeof _userDetails.minimaaddress.mxaddress === "string" && (
              <QRCode
                className="rounded-lg"
                size={200}
                value={_userDetails.minimaaddress.mxaddress}
              />
            )}

          <WalletAddress
            _address={_userDetails.minimaaddress.mxaddress}
            fullAddress
          />
          <p className="text-sm max-w-[236px] text-center">
            Send native Minima to this address (Make sure to split 10)
          </p> */}
      </div>
    </div>
  );
};

export default NativeAddress;
