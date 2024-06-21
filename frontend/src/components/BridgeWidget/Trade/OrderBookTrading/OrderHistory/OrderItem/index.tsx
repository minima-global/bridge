import { OrderActivityEvent } from "../../../../../../types/Order";
import { format } from "date-fns";
import TokenExchange from "../TokenExchange";
import { useState } from "react";
import { useWalletContext } from "../../../../../../providers/WalletProvider/WalletProvider";
import DoneIcon from "../../../../../UI/Icons/DoneIcon";
import * as utils from "../../../../../../utils";
import CloseIcon from "../../../../../UI/Icons/CloseIcon";

// Type safe the date
function formatDate(eventDate) {
  if (typeof eventDate === "string" && /^\d+$/.test(eventDate)) {
    return format(parseInt(eventDate, 10), "MMM dd, yyyy 'at' hh:mm a");
  }
  return "N/A";
}

function _getTokenExchange(order: {[keys: string] : OrderActivityEvent}): any {

  /**
   * Get amount from order.AMOUNT & the token from order.TOKEN
   * then the TXNHASH has to have the actual opposite token&amount
   */

  const _o = Object.values(order).find(order => order.EVENT === 'CPTXN_SENT' || order.EVENT === 'HTLC_STARTED');

  if (!_o) {
    return null;
  }

  const amount = _o.AMOUNT;
  const token = _o.TOKEN;
  const requestamount = _o.TXNHASH.split('-')[2];
  const requesttoken = _o.TXNHASH.split('-')[1];

  return {
    amount, token, requestamount, requesttoken
  }

}

const getOrderStatus = (event) => {
  if (event.includes("HTLC_STARTED")) {
    return "HTLC Contract Created";
  } else if (event.includes("CPTXN_COLLECT")) {
    return "Collected";
  } else if (event.includes("CPTXN_EXPIRED")) {
    return "Refunding our tokens...";
  } else if (event.includes("CPTXN_SENT")) {
    return "Sent tokens to countertparty...";
  } else {
    return "Working...";
  }
};

interface IProps {
  order: {[key: string] :OrderActivityEvent};
}
const OrderItem = ({ order }: IProps) => {
  const [_f, setF] = useState(false);
  const { _network } = useWalletContext();


  if (!order) {
    return null;
  }

  return (
    <li className="grid grid-rows-[auto_1fr] bg-white dark:bg-black bg-opacity-40 pb-2">
      <div className="bg-slate-300 dark:bg-[#1B1B1B] dark:bg-opacity-30 py-1">
        <p className="truncate text-xs text-black font-mono dark:text-teal-300 text-left px-3">
          <span className="text-black dark:text-white">id:</span>
          <input
            onFocus={() => setF(true)}
            onBlur={() => setF(false)}
            readOnly
            value={
              _f
                ? order[0].HASH
                : order[0].HASH.substring(0, 8) +
                  "..." +
                  order[0].HASH.substring(order[0].HASH.length - 8, order[0].HASH.length)
            }
            className={`truncate font-semibold bg-transparent focus:outline-none`}
          />
        </p>
      </div>

      <div className="grid grid-cols-[1fr_2fr_1fr] gap-1">
        <div className="truncate my-auto text-xs grid ml-3">
          <p className="opacity-80 mt-2">Status</p>

          <div className="flex items-center overflow-hidden">
            <input readOnly className="text-xs font-bold truncate focus:outline-none" value={getOrderStatus(order[0].EVENT)} />
            {/* <p className="text-xs font-bold">{getOrderStatus(order[0].EVENT)}</p> */}
            {order[0].EVENT === "CPTXN_COLLECT" &&
              order[0].TXNHASH.includes("0x") && (
                <span className="ml-1 text-teal-600 dark:text-teal-300">
                  <DoneIcon size={16} fill="currentColor" />
                </span>
              )}
            {order[0].EVENT === "CPTXN_COLLECT" &&
              !order[0].TXNHASH.includes("0x") && (
                <span className="ml-1 text-red-600 border-red-600 dark:text-red-300 rounded-full dark:border-red-300 border-2">
                  <CloseIcon size={10} fill="currentColor" />
                </span>
              )}
          </div>

          {order[0].TXNHASH.includes("0x") && order[0].TXNHASH !== '0x00' && (
            <a
              target="_blank"
              onClick={async (e) => {

                if (order[0].TOKEN === 'minima') {           
                  e.preventDefault();       
                  const link = await utils.dAppLink("Block");
                  await new Promise((resolve) => setTimeout(resolve, 150));
                  window.open(
                    `${(window as any).MDS.filehost}${link.uid}/index.html?uid=${
                      link.sessionid
                    }`,
                    window.innerWidth < 568 ? "_self" : "_blank"
                  );

                  return;
                }

                if (window.navigator.userAgent.includes("Minima Browser")) {
                  e.preventDefault();
                  // @ts-ignore
                  Android.openExternalBrowser(
                    `${
                      _network === "mainnet"
                        ? "https://etherscan.io/tx/" + order[0].TXNHASH.split(":")[0]
                        : "https://sepolia.etherscan.io/tx/" + order[0].TXNHASH.split(":")[0]
                    }`,
                    "_blank"
                  );
                }
              }}
              href={`${
                _network === "mainnet"
                  ? "https://etherscan.io/tx/" + order[0].TXNHASH.split(":")[0]
                  : "https://sepolia.etherscan.io/tx/" + order[0].TXNHASH.split(":")[0]
              }`}
              className="truncate"
            >
              {order[0].TXNHASH.substring(0, 8) + "..."}
            </a>
          )}

          {!order[0].TXNHASH.includes("0x") && (
            <input
              readOnly
              value={order[0].TXNHASH}
              className="truncate font-bold bg-transparent focus:outline-none"
            />
          )}
        </div>
        <div className="my-auto">
          {_getTokenExchange(order) === null && <p>-</p>}
          { _getTokenExchange(order) !== null &&
            <TokenExchange {..._getTokenExchange(order)} />          
          }          
        </div>

        <div className="text-right my-auto">
          <p className="text-xs font-bold dark:text-yellow-300 mr-3">
            {formatDate(order[0].EVENTDATE)}
          </p>
        </div>
      </div>
    </li>
  );
};

export default OrderItem;
