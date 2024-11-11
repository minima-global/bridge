import InputWrapper from "../../../../UI/FormComponents/InputWrapper";
import FavoriteIcon from "../../../../UI/Icons/FavoriteIcon";
import NativeMinima from "../../../../NativeMinima";
import EthereumTokenSelect from "../EthereumTokenSelect";
import { Formik, FormikProps } from "formik";
import * as yup from "yup";
import { useContext, useEffect, useRef } from "react";
import { appContext } from "../../../../../AppContext";
import Decimal from "decimal.js";
import { useWalletContext } from "../../../../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../../../../constants";
import { useNavigate, useSearchParams } from "react-router-dom";

interface FormValues {
  uid: string;
  native: string;
  token: { name: string; amount: string };
  locked: boolean;
}

const OTCForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    _minimaBalance,
    handleActionViaBackend,
    notify,
    _allowanceLock,
    setPromptAllowance,
  } = useContext(appContext);
  const { _network } = useWalletContext();
  const formikRef = useRef<FormikProps<FormValues>>(null);
  
  const initialValues: FormValues = {
    uid: searchParams.get("contact") || "",
    native: "",
    token: { name: "WMINIMA", amount: "" },
    locked: false,
  };


  useEffect(() => {
    const contact = searchParams.get("contact");
    if (contact && formikRef.current) {
      formikRef.current.setFieldValue("uid", contact);
    }
  }, [searchParams]);

  return (
    <Formik
      innerRef={formikRef}
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={async (data, { resetForm }) => {
        const { uid, native, token } = data;
        try {
          const message = {
            action: "STARTMINIMASWAP",
            sendamount: native,
            requestamount: token.amount,
            contractaddress:
              "ETH:" +
              "0x" +
              _defaults[token.name.includes("WMINIMA") ? "wMinima" : "Tether"][
                _network
              ]
                .slice(2)
                .toUpperCase(),
            reqpublickey: uid,
            otc: true,
          };

          await handleActionViaBackend(message);

          notify("OTC Swap requested!");
          resetForm();
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
        uid: yup
          .string()
          .matches(/^\d*\.?\d+$|^0x[0-9A-Fa-f]+$/, "Enter a valid OTC identity")
          .required("An OTC identity is required"),
        native: yup
          .string()
          .matches(/^\d*\.?\d+$/, "Enter a valid amount")
          .required("Amount is required")
          .test("has funds", function (val) {
            const { path, createError } = this;

            try {
              if (new Decimal(val).gt(_minimaBalance.confirmed)) {
                throw new Error();
              }

              if (new Decimal(val).isZero()) {
                throw new Error("Amount is required");
              }

              if (new Decimal(_minimaBalance.confirmed).lt(1)) {
                throw new Error("You are running low on funds");
              }

              if (new Decimal(val).decimalPlaces() > 4) {
                throw new Error("Can't exceed more than 4 decimal places");
              }

              return true;
            } catch (error) {
              if (error instanceof Error) {
                return createError({
                  path,
                  message:
                    error && error.message
                      ? error.message
                      : "You do not have enough funds",
                });
              }
              return createError({
                path,
                message: "Enter a valid number",
              });
            }
          }),
        token: yup.object().shape({
          amount: yup
            .string()
            .matches(/^\d*\.?\d+$/, "Enter a valid amount")
            .required("Amount is required")
            .test("valid amount", function (val) {
              const { path, createError } = this;

              try {
                if (new Decimal(val).isZero()) {
                  throw new Error("Amount is required");
                }

                if (new Decimal(val).decimalPlaces() > 4) {
                  throw new Error("Can't exceed more than 4 decimal places");
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
        }),
      })}
    >
      {({
        handleSubmit,
        getFieldProps,
        setFieldValue,
        values,
        errors,
        touched,
        isValid,
      }) => (
        <form onSubmit={handleSubmit} className="shadow-sm dark:shadow-none">
          <InputWrapper
            errors={
              errors && errors.uid && touched && touched.uid
                ? errors.uid
                : false
            }
            inputProps={{
              placeholder: "uid",
              ...getFieldProps("uid"),
              onChange: (e) => {
                setFieldValue("uid", e.target.value);
                const newParams = new URLSearchParams(searchParams);
                newParams.set("contact", e.target.value);
                navigate(`?${newParams.toString()}`, { replace: true });
              },
            }}
            action={
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("form", "true");
                    newParams.set("contact", values.uid);
                    navigate(`/fav?${newParams.toString()}`);
                  }}
                  type="button"
                  className="hover:animate-pulse text-sm flex items-center text-center"
                >
                  <FavoriteIcon fill="currentColor" />
                </button>
              </div>
            }
            label="Your Counterparty"
          />

          <InputWrapper
            errors={
              errors && errors.native && touched && touched.native
                ? errors.native
                : false
            }
            wrapperStyle="mt-2"
            inputProps={{ placeholder: "0.0", ...getFieldProps("native") }}
            label="Native Offering"
            action={
              <div className="flex items-center justify-center pb-1 sm:pb-0">
                <NativeMinima display={true} />
              </div>
            }
          />

          <InputWrapper
            errors={
              errors && errors.token?.amount && touched && touched.token?.amount
                ? errors.token.amount
                : false
            }
            wrapperStyle="mt-2"
            inputProps={{
              placeholder: "0.0",
              ...getFieldProps("token.amount"),
            }}
            label="Requesting Amount"
            action={
              <EthereumTokenSelect
                token={values.token.name}
                setToken={(name) => setFieldValue("token.name", name)}
              />
            }
          />

          {!_allowanceLock && (
            <div className="my-8">
              <button
                // disabled={true}
                disabled={!isValid}
                type="submit"
                className="w-full bg-[#1B1B1B] dark:bg-neutral-300 py-4 dark:text-[#1B1B1B] hover:dark:bg-neutral-200 text-neutral-100 font-bold tracking-wider rounded hover:bg-black disabled:bg-opacity-30 dark:disabled:bg-opacity-30"
              >
                Trade
              </button>
            </div>
          )}
          {_allowanceLock && (
            <button
              onClick={() => setPromptAllowance(true)}
              type="button"
              className="mt-4 w-full bg-violet-300 p-3 font-bold dark:text-black trailing-wider"
            >
              Approve allowances
            </button>
          )}
        </form>
      )}
    </Formik>
  );
};

export default OTCForm;
