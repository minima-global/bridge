import { useState } from "react";
import { format } from "date-fns";
import { useWalletContext } from "../../../../../../providers/WalletProvider/WalletProvider";
import * as utils from "../../../../../../utils";
import { OrderActivityEvent } from "../../../../../../types/Order";
import {
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import OrderHash from "../OrderHash";

function formatDate(eventDate: string) {
  if (/^\d+$/.test(eventDate)) {
    return format(parseInt(eventDate, 10), "MMM dd, yyyy 'at' hh:mm a");
  }
  return "N/A";
}

// function _getTokenExchange(order: { [keys: string]: OrderActivityEvent }) {
//   const _o = Object.values(order).find(
//     (order) => order.EVENT === "CPTXN_SENT" || order.EVENT === "HTLC_STARTED"
//   );

//   if (!_o) {
//     return null;
//   }

//   const amount = _o.AMOUNT;
//   const token = _o.TOKEN;
//   const requestamount = _o.TXNHASH.split("-")[2];
//   const requesttoken = _o.TXNHASH.split("-")[1];

//   return { amount, token, requestamount, requesttoken };
// }

const getOrderStatus = (event: string) => {
  if (event.includes("HTLC_STARTED")) return "HTLC Contract Created";
  if (event.includes("CPTXN_COLLECT")) return "Collected";
  if (event.includes("CPTXN_EXPIRED")) return "Refunding our tokens...";
  if (event.includes("CPTXN_SENT")) return "Sent tokens to counterparty...";
  return "Working...";
};

interface IProps {
  order: { [key: string]: OrderActivityEvent };
}

const OrderItem = ({ order }: IProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { _network } = useWalletContext();

  if (!order) {
    return null;
  }

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleTxClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (order[0].TOKEN === "minima") {
      e.preventDefault();
      const link = await utils.dAppLink("Block");
      await new Promise((resolve) => setTimeout(resolve, 150));
      window.open(
        `${(window as any).MDS.filehost}${link.uid}/index.html?uid=${
          link.sessionid
        }#/t/${order[0].TXNHASH.split("-")[0]}`,
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
            ? "https://etherscan.io/tx/" + order[0].TXNHASH.split("-")[0]
            : "https://sepolia.etherscan.io/tx/" +
              order[0].TXNHASH.split("-")[0]
        }`,
        "_blank"
      );
    }
  };

  return (
    <li className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <OrderHash hash={order[0].HASH} />
          <button
            onClick={toggleExpand}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label={
              isExpanded ? "Collapse order history" : "Expand order history"
            }
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full sm:w-auto mb-2 sm:mb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <div className="flex items-center">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {getOrderStatus(order[0].EVENT)}
              </p>
              {order[0].EVENT === "CPTXN_COLLECT" &&
                (order[0].TXNHASH.includes("0x") ? (
                  <CheckCircle className="ml-2 w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="ml-2 w-4 h-4 text-red-500" />
                ))}
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {formatDate(order[0].EVENTDATE)}
          </p>
        </div>
        {isExpanded && (
          <div className="mt-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Transaction
              </p>
              {order[0].TXNHASH.includes("0x") &&
              order[0].TXNHASH !== "0x00" ? (
                <a
                  href={`${
                    _network === "mainnet"
                      ? "https://etherscan.io/tx/" +
                        order[0].TXNHASH.split("-")[0]
                      : "https://sepolia.etherscan.io/tx/" +
                        order[0].TXNHASH.split("-")[0]
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleTxClick}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {order[0].TXNHASH.substring(0, 8) + "..."}
                  <ExternalLink className="ml-1 w-4 h-4" />
                </a>
              ) : (
                <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  {order[0].TXNHASH}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Token Exchange
              </p>
              {/* {_getTokenExchange(order) ? (
                <TokenExchange {..._getTokenExchange(order)} />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No exchange information available
                </p>
              )} */}
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

export default OrderItem;
