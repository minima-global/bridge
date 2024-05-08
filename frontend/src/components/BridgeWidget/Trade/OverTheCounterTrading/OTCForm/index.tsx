import InputWrapper from "../../../../UI/FormComponents/InputWrapper";
import FavoriteIcon from "../../../../UI/Icons/FavoriteIcon";
import NativeMinima from "../../../../NativeMinima";
import EthereumTokenSelect from "../EthereumTokenSelect";
import { Formik } from "formik";
import * as yup from "yup";
import { useContext } from "react";
import { appContext } from "../../../../../AppContext";
import Decimal from "decimal.js";
import { useWalletContext } from "../../../../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../../../../constants";

const OTCForm = () => {
  const { _minimaBalance, handleActionViaBackend, notify, promptFavorites } = useContext(appContext);
  const { _network } = useWalletContext();
  
  return (
    <Formik
      initialValues={{
        uid: "",
        native: 0,
        token: { name: "WMINIMA", amount: "" },
      }}
      onSubmit={async (data, {resetForm}) => {
        
        const { uid, native, token } = data;

        console.log('NATIVE', native);
        console.log('REQUEST AMOUNT', token.amount);
        try {          
          const message = {
            action: "STARTMINIMASWAP",
            sendamount: native,
            requestamount: token.amount,
            contractaddress: "ETH:"+"0x"+_defaults[token.name.includes("WMINIMA") ? 'wMinima' : 'Tether'][_network].slice(2).toUpperCase(),
            reqpublickey: uid,
            otc: true,
          }

          const res = await handleActionViaBackend(message);

          notify("OTC Swap requested!");
          resetForm();

          console.log(res);

        } catch (error) {
          
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

                return true;
              } catch (error) {
                if (error instanceof Error) {
                  return createError({
                    path,
                    message:
                      error && error.message
                        ? error.message
                        : "Invalid number",
                  });
                }                
              }
            }),
        }),
      })}
    >
      {({ handleSubmit, getFieldProps, setFieldValue, values, errors, touched, isValid }) => (
        <form onSubmit={handleSubmit}>
          <InputWrapper
            errors={errors && errors.uid && touched && touched.uid ? errors.uid : false}
            inputProps={{ placeholder: "uid", ...getFieldProps("uid") }}
            action={ 
              <div className="flex items-center justify-center">
              <button
                onClick={promptFavorites}
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
            errors={errors && errors.native && touched && touched.native ? errors.native : false}
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
              errors && errors.token?.amount && touched && touched.token?.amount ? errors.token.amount : false
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

          <button
            disabled={!isValid}
            type="submit"
            className="mt-4 w-full bg-black py-4 text-white dark:bg-orange-600 font-bold dark:text-black disabled:bg-gray-100 disabled:bg-opacity-5"
          >
            Trade
          </button>
        </form>
      )}
    </Formik>
  );
};

export default OTCForm;
