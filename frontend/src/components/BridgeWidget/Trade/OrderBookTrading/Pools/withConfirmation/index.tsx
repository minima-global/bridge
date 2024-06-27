import { useContext, useEffect, useState } from "react";
import AnimatedDialog from "../../../../../UI/AnimatedDialog";
import { FormikContextType, FormikValues, useFormikContext } from "formik";

import * as utils from "../utils";
import { appContext } from "../../../../../../AppContext";
import DoubleArrowIcon from "../../../../../UI/Icons/DoubleArrow";
import { _defaults } from "../../../../../../constants";
import { useWalletContext } from "../../../../../../providers/WalletProvider/WalletProvider";

interface EthSwapMessage {
  action: "STARTETHSWAP";
  reqpublickey: string;
  erc20contract: string;
  reqamount: number;
  amount: string;
}

interface MinimaSwapMessage {
  action: "STARTMINIMASWAP";
  reqpublickey: string;
  contractaddress: string;
  requestamount: number;
  sendamount: string;
}

const withConfirmation = (WrappedComponent) => {
  return (props) => {
    const { _userDetails, _allowanceLock, setPromptAllowance } =
      useContext(appContext);
    const { _network } = useWalletContext();
    const [show, setShow] = useState(false);
    const [orderType, setOrderType] = useState<"buy" | "sell" | null>(null);
    const [tokenType, setTokenType] = useState<"wminima" | "usdt" | null>(null);
    const formik: FormikContextType<FormikValues> = useFormikContext();
    const { values, setFieldValue } = formik;
    const [opposingTokenAmount, setOpposingTokenAmount] = useState<
      number | null
    >(null);

    useEffect(() => {
      calculateOrder();
    }, [values, orderType, tokenType, _userDetails]);

    const calculateOrder = async () => {
      if (orderType === null || tokenType === null) return;
      const { favorites, native } = values; // FORMIK
      const _ord = await utils.matchOrder(
        favorites,
        orderType,
        native,
        tokenType,
        _userDetails.minimapublickey
      );

      if (_ord) {
        setOpposingTokenAmount(_ord.orderPrice);
        let message: MinimaSwapMessage | EthSwapMessage;
        if (orderType === "buy") {
          message = {
            action: "STARTETHSWAP",
            reqpublickey: _ord.order.ethpublickey,
            erc20contract:
              tokenType === "wminima"
                ? "0x" + _defaults.wMinima[_network].slice(2).toUpperCase()
                : "0x" + _defaults.Tether[_network].slice(2).toUpperCase(),
            reqamount: _ord.orderPrice,
            amount: native,
          };
        } else {
          message = {
            action: "STARTMINIMASWAP",
            reqpublickey: _ord.order.publickey,
            contractaddress:
              tokenType === "wminima"
                ? "ETH:" +
                  "0x" +
                  _defaults.wMinima[_network].slice(2).toUpperCase()
                : "ETH:" +
                  "0x" +
                  _defaults.Tether[_network].slice(2).toUpperCase(),
            requestamount: _ord.orderPrice,
            sendamount: native,
          };
        }
        // Cook the transaction message for the form
        setFieldValue("transaction", message);
      } else {
        setOpposingTokenAmount(null);
        setFieldValue("transaction", "");
      }
    };

    const handleShow = (
      _orderType: "buy" | "sell",
      _token: "wminima" | "usdt"
    ) => {
      setShow(true);
      setOrderType(_orderType);
      setTokenType(_token);
    };
    const handleClose = () => setShow(false);

    const handleConfirm = () => {
      // Custom logic on confirm
      setShow(false);
      // You can add additional logic here, for example, form submission or other processing
      props.onSubmit();
    };

    return (
      <>
        <WrappedComponent {...props} onShowConfirm={handleShow} />

        <AnimatedDialog
          onClose={handleClose}
          isOpen={show}
          position="items-start mt-20"
          extraClass="max-w-sm mx-auto"
          dialogStyles="h-[400px] rounded-lg !shadow-teal-800 !shadow-sm overflow-hidden"
        >
          <>
            <div className="flex justify-between items-center pr-4">
              <div className="grid grid-cols-[auto_1fr] ml-2">
                <h3 className="my-auto font-bold ml-2">
                  {opposingTokenAmount !== null
                    ? "Matching order!"
                    : "No matching order"}
                </h3>
              </div>
              <svg
                onClick={handleClose}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                strokeWidth="4.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M18 6l-12 12" />
                <path d="M6 6l12 12" />
              </svg>
            </div>
            <div className="px-4 py-3 text-sm flex flex-col justify-between h-full">
              {opposingTokenAmount && (
                <p>
                  You are {orderType === "buy" ? "buying" : "selling"}{" "}
                  <span className="font-mono tracking-wide">
                    {values.native}
                  </span>{" "}
                  <span className="font-bold">Native Minima</span> for{" "}
                  <span className="font-mono tracking-wide">
                    {opposingTokenAmount}
                  </span>{" "}
                  <span className="font-bold">
                    {tokenType === "usdt" ? "USDT" : "WMINIMA"}{" "}
                  </span>
                </p>
              )}
              {opposingTokenAmount && (
                <div className="bg-transparent text-black dark:bg-black dark:text-white rounded-lg px-2 mx-auto">
                  <div className="flex items-center gap-2">
                    <div className="grid grid-cols-[34px_auto]">
                      {orderType === "buy" && (
                        <img
                          alt="minima"
                          src={
                            tokenType === "usdt"
                              ? "./assets/tether.svg"
                              : "./assets/wtoken.svg"
                          }
                          className="rounded-full"
                        />
                      )}
                      {orderType === "sell" && (
                        <img
                          alt="minima"
                          src="./assets/token.svg"
                          className="rounded-full"
                        />
                      )}
                      <p className="truncate text-sm my-auto font-mono font-bold ml-2">
                        {values.native}
                      </p>
                    </div>

                    <div className="">
                      <DoubleArrowIcon
                        fill="fill-black dark:fill-white"
                        size={22}
                      />
                    </div>

                    <div className="grid grid-cols-[34px_1fr]">
                      {orderType === "sell" && (
                        <img
                          alt="minima"
                          src={
                            tokenType === "usdt"
                              ? "./assets/tether.svg"
                              : "./assets/wtoken.svg"
                          }
                          className="rounded-full"
                        />
                      )}
                      {orderType === "buy" && (
                        <img
                          alt="minima"
                          src="./assets/token.svg"
                          className="rounded-full"
                        />
                      )}
                      <p className="truncate text-sm my-auto font-mono font-bold ml-2">
                        {opposingTokenAmount}
                      </p>
                    </div>
                  </div>
                  <div />
                </div>
              )}
              {!opposingTokenAmount && <p>No order found</p>}
              <div className="grid grid-cols-[1fr_auto] pb-3">
                <div />
                {_allowanceLock && (
                  <button
                    onClick={() => {
                      handleClose();
                      setPromptAllowance(true);
                    }}
                    type="button"
                    className="mt-4 bg-violet-300 p-3 font-bold dark:text-black trailing-wider"
                  >
                    Approve
                  </button>
                )}
                {!_allowanceLock && opposingTokenAmount && (
                  <button
                    type="submit"
                    onClick={handleConfirm}
                    className={`bg-black tracking-wider text-white font-bold dark:text-black ${
                      orderType === "buy" ? "bg-teal-500" : "bg-red-500"
                    }`}
                  >
                    {orderType === "buy" && "Buy"}
                    {orderType === "sell" && "Sell"}
                  </button>
                )}
                {!opposingTokenAmount && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className={`bg-black dark:bg-white tracking-wider text-white font-bold dark:text-black`}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </>
        </AnimatedDialog>
      </>
    );
  };
};

export default withConfirmation;
