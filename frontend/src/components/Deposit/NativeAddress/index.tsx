import { useContext, useEffect, useState } from "react";
import { appContext } from "../../../AppContext";
import ProgressIcon from "../../UI/Progress";
import { Formik } from "formik";
import * as yup from "yup";
import Decimal from "decimal.js";
import { primaryButtonStyle } from "../../../styles";

const NativeAddress = () => {
  const {
    _userDetails,
    getMainMinimaBalance,
    getWalletBalance,
    _mainBalance,
    notify,
  } = useContext(appContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [f, setF] = useState(false);

  useEffect(() => {
    getMainMinimaBalance();
  }, []);

  const getBalances = async () => {
    getWalletBalance();
    getMainMinimaBalance();
  };

  if (_userDetails === null) {
    return <ProgressIcon />;
  }

  const mainWalletBalance = _mainBalance && _mainBalance.unconfirmed === "0" 
    ? new Decimal(_mainBalance.sendable).toFixed(1) 
    : _mainBalance && _mainBalance.unconfirmed !== "0" 
      ? new Decimal(_mainBalance.sendable).toFixed(1) + "/" + new Decimal(_mainBalance.unconfirmed).toString()
      : '-'
  return (
    <div className="bg-violet-50 p-6 rounded-md">
      <Formik
        initialValues={{ amount: 0 }}
        onSubmit={async ({ amount }, { resetForm }) => {
          setLoading(true);

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
                        : "Failed, please try again later"
                    );

                  resolve(resp.status);
                }
              );
            });

            resetForm();
            notify(
              "Your deposit of " +
                amount +
                " MINIMA to the Swap Wallet is on its way!"
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
            .number()
            .required("Enter an amount")
            .test("has funds", function (val) {
              const { path, createError } = this;

              try {
                if (_mainBalance === null) {
                  throw new Error("Balance not available.  Try a refresh.");
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
          values,
          isSubmitting,
          errors,
          isValid,
          dirty,
        }) => (
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-100 max-w-sm mx-auto space-y-4"
          >
            <div className="bg-purple-100 text-purple-800 p-4 rounded-lg shadow-sm">
              <p className="text-sm font-medium">Main Wallet Balance:</p>
              <p className="text-2xl font-bold break-all">
                {mainWalletBalance} MINIMA
              </p>
            </div>
            <div className="bg-white border border-purple-200 flex rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
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
                type="number"
                step="any"
                autoFocus={false}
                placeholder="Amount"
                className="bg-transparent truncate focus:outline-none placeholder:text-purple-300 text-purple-800 font-bold w-full py-3 px-4"
              />
              <div className="h-full my-auto pr-2">
                <button
                  onClick={() =>
                    setFieldValue(
                      "amount",
                      _mainBalance !== null ? _mainBalance.sendable : 0
                    )
                  }
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

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded-r-lg flex items-start space-x-3">
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold text-lg flex items-center">
                    <span>Deposit Failed</span>
                  </h3>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <button
              disabled={loading || !isValid || !dirty}
              type="submit"
              className={primaryButtonStyle}
            >
              {!loading ? "Deposit" : <span className="flex justify-center"><ProgressIcon /></span>}
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default NativeAddress;
