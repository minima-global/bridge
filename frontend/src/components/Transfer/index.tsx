import { parseUnits } from "ethers";
import { Formik } from "formik";
import { useContext, useEffect, useState } from "react";
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
  const { _currentNetwork, _defaultNetworks, _minimaBalance, getWalletBalance, getMainMinimaBalance, setTriggerBalanceUpdate } =
    useContext(appContext);
  const { _network, getEthereumBalance } = useWalletContext();
  const { tokens } = useTokenStoreContext();

  const [ethWalletAddress, setEthWalletAddress] = useState("");

  const [f, setF] = useState({amount: false, address: false});

  const [_, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);

  const initialTokenShouldBeMinimaIfExists = tokens.find(
    (token) => token.address === _defaults["wMinima"][_network]
  );

  const getBalances = async () => {
    // Wait a few secs
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });

    getWalletBalance();
    getMainMinimaBalance();
  };

  const handlePullBalance = async () => {
    // Pause for 3 seconds
    await new Promise((resolve) => {
      setTimeout(resolve, 7000);
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
    if (type === 'erc20') {
      (async () => {
        (window as any).MDS.cmd(
          "seedrandom modifier:ghost",
          async (resp) => {
            try {
              const genKey = resp.response.seedrandom;
              const _address = await new Wallet(genKey).getAddress();      
              setEthWalletAddress(_address);
            } catch (error) {
              console.error('Failed to gen eth wallet', error);
            }
          }
        );        
      })();
    }
  }, [type]);

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
        address: ethWalletAddress,
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
                const decimals = parent.asset.name === "Tether" ? 6 : 18;
                if (
                  parent.asset.type === "erc20" &&
                  (new Decimal(parseUnits(val, decimals).toString()).gt(
                    assetBalance
                  ) ||
                    new Decimal(assetBalance).isZero())
                  // || transactionTotal && new Decimal(transactionTotal!).gt(_wrappedMinimaBalance)
                ) {
                  throw new Error();
                }
              }
              if (type === "native") {
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
      onSubmit={async ({ amount, asset, address }, { setStatus, resetForm }) => {
        setError(false);
        setLoading(true);
        setStatus(undefined);
        try {
          let action;

          if (type === "erc20") {
            if (asset.name === "wMinima") {
              action = "SENDWMINIMA";
            } else if (asset.name === "Ethereum" || asset.name === 'SepoliaETH') {
              action = "SENDETH";
            } else if (asset.name === "Tether") {
              action = "SENDUSDT";
            }    
            
            if (!address.length && !ethWalletAddress.length) {
              throw new Error("Please enter an address");
            }
          }

          await submitForm(
            type === "native" ? amount : { amount, action, address: address.length ? address : ethWalletAddress }
          );


          setStatus("Successful");
          if (type === 'native') {
            await getBalances();  
          } else {
            await handlePullBalance();
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
        }
      }}
    >
      {({
        handleSubmit,
        handleChange,
        handleBlur,
        isSubmitting,
        values,
        touched,
        errors,
        isValid,
        dirty,
        status,
      }) => (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">{type === "erc20" && <SelectAsset />}</div>
          <div>
            {type === 'erc20' &&

            <>
              <div
                className={`my-2 flex space-x-2 bg-black ${f.address && "!bg-white"} rounded ${
                  f.address && !errors.address && "outline outline-violet-300" 
                } ${
                  touched.address && errors.address
                    ? "!border-4 !outline-none !border-red-500"
                    : ""
                }`}
              >
                <input
                  disabled={isSubmitting}
                  onBlur={(e) => {
                    handleBlur(e);
                    setF(prevState => ({...prevState, address: false}));
                  }}
                  onChange={handleChange}
                  value={values.address}
                  id="address"
                  name="address"
                  onFocus={() => setF(prevState => ({...prevState, address: true}))}
                  type="text"              
                  placeholder="Address"
                  className={`bg-transparent truncate focus:outline-none focus:placeholder:text-black focus:bg-white placeholder:text-white text-white dark:text-white focus:text-black font-bold w-full py-3 rounded-lg px-4 dark:placeholder:text-white`}
                />              
                
              </div>          
              <p className="text-xs mb-2 font-bold">Leave address field empty if you want to withdraw to your ETH Wallet ({ethWalletAddress.substring(0,4)+"..."+ethWalletAddress.substring(ethWalletAddress.length-4,ethWalletAddress.length)})</p>
            </>
            }
            <div
              className={`flex space-x-2 bg-black ${f.amount && "!bg-white"} rounded ${
                f.amount && !errors.amount && "outline outline-violet-300" 
              } ${
                touched.amount && errors.amount
                  ? "!border-4 !outline-none !border-red-500"
                  : ""
              }`}
            >
              <input
                disabled={isSubmitting}
                onBlur={(e) => {
                  handleBlur(e);
                  setF(prevState => ({...prevState, amount: false}));
                }}
                onChange={handleChange}
                value={values.amount}
                id="amount"
                name="amount"
                onFocus={() => setF(prevState => ({...prevState, amount: true}))}
                required
                type="text"              
                placeholder="Amount"
                className={`bg-transparent truncate focus:outline-none focus:placeholder:text-black focus:bg-white placeholder:text-white text-white dark:text-white focus:text-black font-bold w-full py-3 rounded-lg px-4 dark:placeholder:text-white`}
              />              
            </div>

            {errors.amount && (
              <div className="p-2 bg-red-500 text-white dark:text-black font-bold rounded-lg mt-3 mb-2 outline outline-red-500">
                {errors.amount}
              </div>
            )}
          </div>

          {status && (
            <div className={`text-center my-2 bg-teal-500 p-2 rounded ${type === 'erc20' && "!bg-orange-500"}`}>
              <h6 className="font-bold text-teal-800 dark:text-black">
                {type === 'erc20' && "Withdrawal Requested"}
                {type !== 'erc20' && "Withdrawal Successful"}                
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
