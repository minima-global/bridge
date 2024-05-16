import { useContext, useEffect, useState } from "react";
import { appContext } from "../../../AppContext";
import ProgressIcon from "../../UI/Progress";
import { Formik } from "formik";
import * as yup from "yup";
import Decimal from "decimal.js";
import NativeMinima from "../../NativeMinima";

const NativeAddress = () => {
  const { _userDetails, getMainMinimaBalance, _mainBalance, promptDeposit } =
    useContext(appContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [f, setF] = useState(false);

  useEffect(() => {
    getMainMinimaBalance();
  }, []);

  if (_userDetails === null) {
    return <ProgressIcon />;
  }
  return (
    <div className="my-4">
      <div className="flex flex-col gap-3 max-w-sm mx-auto">
        <Formik
          initialValues={{ amount: 0 }}
          onSubmit={async ({ amount }, { setStatus }) => {
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
                          : "Failed, please try again later"
                      );

                    resolve(resp.status);
                  }
                );
              });

              setStatus("Done!");
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
              .required("Amount is required")
              .test("has funds", function (val) {
                const { path, createError } = this;

                try {
                  if (_mainBalance === null) {
                    throw new Error("Balance not available...");
                  }

                  if (new Decimal(val).isZero()) {
                    throw new Error("Amount is required");
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
          }) => (
            <form onSubmit={handleSubmit} className="px-4">
              {_mainBalance !== null && (
                <NativeMinima
                  display={false}
                  external={_mainBalance.sendable}
                  full={false}
                />
              )}
              <div
                className={`flex space-x-2 bg-black ${
                  f && "!bg-white"
                } rounded ${f && "outline outline-violet-300"} ${
                  touched.amount && errors.amount
                    ? "!border-4 !outline-none !border-red-500"
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
                  autoFocus
                  placeholder="Amount"
                  className={`bg-transparent truncate focus:outline-none focus:placeholder:text-black focus:bg-white placeholder:text-white text-white dark:text-black focus:text-black dark:placeholder:text-black font-bold w-full py-3 rounded-lg px-4 `}
                />
                <div className="h-full my-auto">
                  <button
                    onClick={() =>
                      setFieldValue(
                        "amount",
                        _mainBalance !== null ? _mainBalance.sendable : 0
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
                <div className="p-2 bg-red-500 text-white dark:text-black font-bold rounded-lg mt-3 mb-2 outline outline-red-500">
                  {errors.amount}
                </div>
              )}

              {status && (
                <div className="text-center my-2 bg-teal-500 p-2 rounded">
                  <h6 className="font-bold text-teal-800 dark:text-black">
                    Deposit Successful
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

              <div className="grid grid-cols-2 mt-3 gap-2">
                {loading && <div />}
                {!loading && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      promptDeposit();                      
                    }}
                    className="bg-gray-500 text-white dark:text-black font-bold"
                  >
                    Cancel
                  </button>
                )}
                <button
                  disabled={loading}
                  type="submit"
                  className="bg-orange-600 font-bold flex justify-center text-white dark:text-black disabled:bg-opacity-50"
                >
                  {!loading && "Deposit"}
                  {loading && <ProgressIcon />}
                </button>
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
