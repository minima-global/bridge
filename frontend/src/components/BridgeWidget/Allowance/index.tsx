import { Formik } from "formik";
import useAllowanceChecker from "../../../hooks/useAllowanceChecker";
import { useContext, useState } from "react";
import { appContext } from "../../../AppContext";
import { MaxUint256 } from "ethers";
import { getTokenTransferApproval } from "../../../libs/getTokenTransferApproval";
import { Token } from "@uniswap/sdk-core";
import { useWalletContext } from "../../../providers/WalletProvider/WalletProvider";
import { _defaults } from "../../../constants";

const Allowance = () => {
  const {
    _network: currentNetwork,
    _wallet: signer,
    _address,
  } = useWalletContext();
  const { _promptAllowance, promptAllowance } = useContext(appContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | false>(false);
  const [step, setStep] = useState(1);  

  // this should check on load our allowances for both USDT & wMinima on the HTLC contract
  useAllowanceChecker();

  if (!_promptAllowance) {
    return null;
  }



  return (
    <div className="flex justify-center items-center relative">
      <div className="backdrop-blur-sm z-10 fixed left-0 right-0 top-[90px] bottom-0"></div>
      <div className="z-20 h-[400px] overflow-y-scroll absolute w-full max-w-sm bg-white dark:bg-black rounded-lg !shadow-teal-800 !shadow-sm overflow-hidden">
        <div className="flex justify-between py-3 items-center px-4">
          {!loading && !error && step === 1 &&
          <h3 className="my-auto font-bold">Allowance Approval</h3>
          }
          {!loading && !error && step === 2 &&
          <h3 className="my-auto font-bold">Allowance Approved</h3>
          }
          {!loading && error &&
          <h3 className="my-auto font-bold">Approval Failed</h3>
          }
          {loading && !error &&
          <h3 className="my-auto font-bold">Approving Allowance</h3>
          }
        </div>
        <div>
          {!loading && !error && step === 1 &&
          <p className="px-4 text-sm">
            Approve wMinima & USDT allowance on the HTLC contract to start
            trading.
          </p>        
          }
          {!loading && !error && step === 2 &&
          <p className="px-4 text-sm">
            Approved Allowances, ready to go!
          </p>        
          }
          {!loading && error &&
          <p className="px-4 text-sm">
            {error}
          </p>        
          }
          
          {loading &&
          <p className="px-4 text-sm animate-pulse text-black dark:text-teal-300">
            Approving...
          </p>        
          }
        </div>

        <Formik
          initialValues={{
            
          }}
          onSubmit={async () => {
            setLoading(true);
            setError(false);

            try {
              const supportedChains =
                currentNetwork === "mainnet"
                  ? 1
                  : 11155111;
              const wMinimaAddress = _defaults["wMinima"][currentNetwork];
              const tetherAddress = _defaults["Tether"][currentNetwork];

              const wMinima = new Token(
                supportedChains,
                wMinimaAddress,
                18,
                "WMINIMA",
                "wMinima"
              );
              const tether = new Token(
                11155111,
                tetherAddress,
                currentNetwork === "mainnet" ? 6 : 18,
                "USDT",
                "Tether"
              );

              await getTokenTransferApproval(
                wMinima,
                MaxUint256.toString(),
                signer!,
                _address!
              );
              await getTokenTransferApproval(
                tether,
                MaxUint256.toString(),
                signer!,
                _address!
              );

              setStep(2);
            } catch (error) {
              setStep(1);
              if (error instanceof Error) {
                return setError(error.message);
              }

              setError("Allowance approval failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          {({handleSubmit}) => (
            <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100%_-_100px)]">
              <div className="flex-grow" />
              {/* <div className={`bg-[#1B1B1B] m-3 p-3 rounded-lg ${_f.wminima && "!outline !outline-yellow-300"}`}>
                <label className="text-xs">Allowance</label>
                <div className="grid grid-cols-[1fr_32px] gap-2">
                  <input onFocus={handleFocus} onBlur={handleBlur} readOnly name="wminima" id="wminima" placeholder="Enter amount to approve" className='truncate rounded-lg bg-transparent focus:outline-none' type="number" />
                  <div>
                    <img className="rounded-full" alt="wrapped-minima" src="./assets/wtoken.svg" />
                  </div>
                </div>
              </div> */}

              {/* <div className={`bg-[#1B1B1B] m-3 p-3 rounded-lg ${_f.tether && "!outline !outline-yellow-300"}`}>
                <label className="text-xs">Allowance</label>
                <div className="grid grid-cols-[1fr_32px] gap-2">
                  <input onFocus={handleFocus} onBlur={handleBlur} readOnly placeholder="Enter amount to approve" name="tether" id="tether" className='truncate rounded-lg bg-transparent focus:outline-none' type="number" />
                  <div>
                    <img alt="wrapped-minima" src="./assets/tether.svg" />
                  </div>
                </div>
              </div> */}
              <div className="mx-3">

                {step === 1 &&
                <button type="submit" disabled={loading} className="disabled:bg-gray-500 hover:bg-opacity-80 w-full bg-teal-300 text-white  dark:text-black font-bold">
                  {loading && "Approving..."}
                  {!error && !loading && "Approve"}
                  {error && !loading && "Re-try"}
                </button>              
                }
                {step === 2 &&
                <button type="button" onClick={promptAllowance} className="disabled:bg-gray-500 hover:bg-opacity-80 w-full bg-teal-300 text-white  dark:text-black font-bold">
                  Ready to trade
                </button>              
                }
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Allowance;
