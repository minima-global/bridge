import { useContext, useEffect, useState } from "react";
import AnimatedDialog from "../../../../../UI/AnimatedDialog";
import { FormikContextType, FormikValues, useFormikContext } from "formik";

import * as utils from "../utils";
import { appContext } from "../../../../../../AppContext";
import DoubleArrowIcon from "../../../../../UI/Icons/DoubleArrow";
import { _defaults } from "../../../../../../constants";
import { useWalletContext } from "../../../../../../providers/WalletProvider/WalletProvider";
import { useOrderBookContext } from "../../Context/OrderBookContext";
import { useTokenStoreContext } from "../../../../../../providers/TokenStoreProvider";
import { formatUnits } from "ethers";
import Decimal from "decimal.js";
import CloseIcon from "../../../../../UI/Icons/CloseIcon";
import { primaryButtonStyle } from "../../../../../../styles";

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

const withConfirmation = (WrappedComponent, PoolName) => {
  return (props) => {
    const { orderContext, setOrderContext } = useOrderBookContext();
    const [insufficientFunds, setInsufficientFunds] = useState(false);

    const { _userDetails, _allowanceLock, setPromptAllowance, _minimaBalance } =
      useContext(appContext);

    const { _network } = useWalletContext();
    const [show, setShow] = useState(false);

    const { tokens } = useTokenStoreContext();
    const formik: FormikContextType<FormikValues> = useFormikContext();
    const { values, setFieldValue, setFieldError } = formik;

    const updateOrder = (order: number | null) => {
      setFieldValue("order", order);
    };

    const updateOrderMessage = (
      message: MinimaSwapMessage | EthSwapMessage | null,
    ) => {
      setFieldValue("transaction", message);
    };

    useEffect(() => {
      // Check the OrderContext, are we buying or selling?
      if (!orderContext.action || !orderContext.pool || !values.order) {
        return;
      }
      // We are buying..
      if (orderContext.action === "buy") {
        // What's the Pool we are on?
        const name = orderContext.pool === "wminima" ? "wMinima" : "Tether";

        // Find the relevant token
        const relevantToken = tokens.find((t) => t.name === name);
        // If we find it..
        if (relevantToken) {
          // Format the Token appropriately and check if we can fulfill the order
          if (
            new Decimal(
              formatUnits(
                relevantToken.balance,
                relevantToken.name === "Tether" && _network === "sepolia"
                  ? 18
                  : relevantToken.decimals,
              ).toString(),
            ).lessThan(values.order)
          ) {
            setInsufficientFunds(true);
          } else {
            setInsufficientFunds(false);
          }
        }
      }
      // We are selling Native
      if (orderContext.action === "sell") {
        // Can we fulfill the order
        if (new Decimal(values.order).greaterThan(_minimaBalance.confirmed)) {
          setInsufficientFunds(true);
        } else {
          setInsufficientFunds(false);
        }
      }
    }, [orderContext, values.order]);

    useEffect(() => {
      calculateOrder();
    }, [values.native, orderContext, _userDetails]);

    const calculateOrder = async () => {
      if (!_userDetails) {
        return setFieldError("native", "Page requires a refresh");
      }

      if (orderContext.action === null) return;

      const { favorites, native } = values; // FORMIK
      const _ord = await utils.matchOrder(
        favorites,
        orderContext.action,
        native,
        PoolName,
        _userDetails.minimapublickey,
      );

      if (_ord) {
        updateOrder(_ord.orderPrice);

        let message: MinimaSwapMessage | EthSwapMessage;
        if (orderContext.action === "buy") {
          message = {
            action: "STARTETHSWAP",
            reqpublickey: _ord.order.ethpublickey,
            erc20contract:
              PoolName === "wminima"
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
              PoolName === "wminima"
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
        updateOrderMessage(message);
      } else {
        // clear
        updateOrder(null);
        updateOrderMessage(null);
      }
    };

    const handleShow = (_orderType: "buy" | "sell") => {
      setShow(true);
      setOrderContext({ action: _orderType, pool: PoolName });
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

        <AnimatedDialog dismiss={handleClose} display={show}>
          <>
            <div className="flex justify-between items-center pr-4">
              <div className="grid grid-cols-[auto_1fr] ml-2">
                <h3 className="my-auto font-bold ml-2">
                  {values.order !== null
                    ? "Matching order!"
                    : "No matching order"}
                </h3>
              </div>
              <span onClick={handleClose}>
                <CloseIcon fill="currentColor" />
              </span>
            </div>
            <div className="px-4 py-3 text-sm flex flex-col justify-between">
              {values.order && (
                <p>
                  You are {orderContext.action === "buy" ? "buying" : "selling"}{" "}
                  <span className="font-mono tracking-wide">
                    {values.native}
                  </span>{" "}
                  <span className="font-bold">Native Minima</span> for{" "}
                  <span className="font-mono tracking-wide">
                    {values.order}
                  </span>{" "}
                  <span className="font-bold">{PoolName.toUpperCase()} </span>
                </p>
              )}
              {values.order && (
                <div className="bg-transparent text-black dark:bg-black dark:text-white rounded-lg px-2 mx-auto">
                  <div className="flex items-center gap-2">
                    <div className="grid grid-cols-[34px_auto]">
                      {orderContext.action === "buy" && (
                        <img
                          alt="minima"
                          src={
                            PoolName === "usdt"
                              ? "./assets/tether.svg"
                              : "./assets/wtoken.svg"
                          }
                          className="rounded-full"
                        />
                      )}
                      {orderContext.action === "sell" && (
                        <img
                          alt="minima"
                          src="./assets/token.svg"
                          className="rounded-full"
                        />
                      )}
                      <p className="truncate text-sm my-auto font-mono font-bold ml-2">
                        {orderContext.action === "buy"
                          ? values.order
                          : values.native}
                      </p>
                    </div>

                    <div className="">
                      <DoubleArrowIcon
                        fill="fill-black dark:fill-white"
                        size={22}
                      />
                    </div>

                    <div className="grid grid-cols-[34px_1fr]">
                      {orderContext.action === "sell" && (
                        <img
                          alt="minima"
                          src={
                            PoolName === "usdt"
                              ? "./assets/tether.svg"
                              : "./assets/wtoken.svg"
                          }
                          className="rounded-full"
                        />
                      )}
                      {orderContext.action === "buy" && (
                        <img
                          alt="minima"
                          src="./assets/token.svg"
                          className="rounded-full"
                        />
                      )}
                      <p className="truncate text-sm my-auto font-mono font-bold ml-2">
                        {orderContext.action === "sell"
                          ? values.order
                          : values.native}
                      </p>
                    </div>
                  </div>
                  <div />
                </div>
              )}
              {!values.order && <p>No order found</p>}
              <div className="grid grid-cols-[1fr_auto] pb-3">
                <div />
                {_allowanceLock && (
                  <button
                    onClick={() => {
                      setPromptAllowance(true);
                    }}
                    type="button"
                    className={`${primaryButtonStyle} mt-4`}
                  >
                    Approve
                  </button>
                )}

                {!_allowanceLock && values.order && (
                  <button
                    type="submit"
                    disabled={insufficientFunds}
                    onClick={handleConfirm}
                    className={`${primaryButtonStyle} ${
                      orderContext.action === "buy"
                        ? "bg-teal-500"
                        : "bg-red-500"
                    } ${insufficientFunds && "bg-yellow-500"}`}
                  >
                    {!insufficientFunds &&
                      orderContext.action === "buy" &&
                      "Buy"}
                    {!insufficientFunds &&
                      orderContext.action === "sell" &&
                      "Sell"}
                    {insufficientFunds && "Insufficient Funds"}
                  </button>
                )}

                {!values.order && !_allowanceLock && (
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
