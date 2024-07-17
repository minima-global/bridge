import { useContext, useEffect, useState } from "react";
import { appContext } from "../../AppContext";
import MostResponsiveTableEver from "../UI/MostResponsiveTableEver";
import { getAllEvents } from "../../../../dapp/js/sql.js";
import { config, useSpring, animated } from "react-spring";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { useWalletContext } from "../../providers/WalletProvider/WalletProvider.js";
import Decimal from "decimal.js";

import * as utils from "../../utils";
import ActivityIcon from "../UI/Icons/ActivityIcon/index.js";
import Tabs from "./Tabs/index.js";
import OrderHistory from "../BridgeWidget/Trade/OrderBookTrading/OrderHistory/index.js";

const renderCell = (
  cellData,
  index,
  handleFocus,
  focusStates,
  txHashFocusStates
) => {
  const {
    EVENT,
    EVENTDATE,
    HASH,
    TOKEN,
    AMOUNT,
    TXNHASH,
    getTokenType,
    _network: network,
  } = cellData;

  const isEthereumEvent =
    TXNHASH !== "0x00" && TXNHASH.includes("0x") && TOKEN !== "minima";
  const isMinimaEvent = TXNHASH === "0x00" || TOKEN === "minima";

  return (
    <>
      <td className="p-3">
        <input
          onFocus={() => handleFocus(index, "hash")}
          onBlur={() => handleFocus(index, "hash")}
          readOnly
          className="w-30 bg-transparent focus:outline-none truncate font-mono text-sm font-bold"
          value={
            !focusStates[index]
              ? HASH.substring(0, 8) +
                "..." +
                HASH.substring(HASH.length - 8, HASH.length)
              : HASH
          }
        />
      </td>
      <td className="p-3">
        {EVENT.includes("WITHDRAW") && (
          <div className="bg-sky-700 rounded-full px-4 w-max py-1 text-white dark:text-black text-xs">
            Withdrew tokens
          </div>
        )}

        {EVENT.includes("STARTED") && (
          <div className="bg-blue-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            Created a contract
          </div>
        )}

        {EVENT.includes("SENDETH") && (
          <div className="bg-orange-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            Sent ETH / ERC20
          </div>
        )}

        {EVENT.includes("COLLECT") &&
          !TXNHASH.includes("Ran out of ETH, disabled orderbook") && (
            <div className="bg-teal-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
              Attempted a collect
            </div>
          )}
        {EVENT.includes("COLLECT") &&
          TXNHASH.includes("Ran out of ETH, disabled orderbook") && (
            <div className="bg-red-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
              Disabled orderbook
            </div>
          )}
        {EVENT.includes("EXPIRED") && (
          <div className="bg-violet-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            Contract expired
          </div>
        )}
        {EVENT.includes("SENT") && (
          <div className="bg-teal-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            Sent counterparty tokens
          </div>
        )}
        {EVENT.includes("APPROVE") && (
          <div className="bg-yellow-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
      </td>

      <td className="p-3">
        <div
          className={`${
            TOKEN === "minima" && "!to-blue-500"
          } bg-gradient-to-r from-white dark:from-black to-teal-600 dark:to-teal-500 rounded-full w-max mx-auto`}
        >
          <img
            className="w-[24px] h-[24px] rounded-full inline-block pl-0.5 pb-0.5"
            src={
              getTokenType(TOKEN) === "wMinima"
                ? "./assets/wtoken.svg"
                : getTokenType(TOKEN) === "Minima"
                ? "./assets/token.svg"
                : "./assets/tether.svg"
            }
          />
          <p className="max-w-xs text-white inline-block my-auto font-mono text-xs px-2">
            {new Decimal(AMOUNT).toString()}
          </p>
        </div>
      </td>
      <td className="p-3">
        {EVENT.includes("EXPIRED") ? (
          <p className="text-xs text-center">
            {TXNHASH.includes("SECRET") ? TXNHASH : "-"}
          </p>
        ) : (
          <>
            {isEthereumEvent && (
              <input
                onFocus={() => handleFocus(index, "txnhash")}
                onBlur={() => handleFocus(index, "txnhash")}
                readOnly
                className="w-30 bg-transparent cursor-pointer focus:outline-none hover:opacity-80 truncate font-mono text-sm font-bold"
                value={
                  !txHashFocusStates[index]
                    ? TXNHASH.substring(0, 8) +
                      "..." +
                      TXNHASH.substring(TXNHASH.length - 8, TXNHASH.length)
                    : TXNHASH
                }
                onClick={(e) => {
                  if (window.navigator.userAgent.includes("Minima Browser")) {
                    e.preventDefault();
                    // @ts-ignore
                    Android.openExternalBrowser(
                      network === "mainnet"
                        ? "https://etherscan.io/tx/" + TXNHASH
                        : "https://sepolia.etherscan.io/tx/" + TXNHASH,
                      "_blank"
                    );
                  }

                  window.open(
                    network === "mainnet"
                      ? "https://etherscan.io/tx/" + TXNHASH
                      : "https://sepolia.etherscan.io/tx/" + TXNHASH,
                    "_blank"
                  );
                }}
              />
            )}

            {isMinimaEvent && TXNHASH.includes("0x") && (
              <input
                onFocus={() => handleFocus(index, "txnhash")}
                onBlur={() => handleFocus(index, "txnhash")}
                onClick={async () => {
                  if (TXNHASH === "0x00" || TXNHASH.includes("Incorrect")) {
                    return;
                  }

                  const link = await utils.dAppLink("Block");
                  await new Promise((resolve) => setTimeout(resolve, 150));
                  window.open(
                    `${(window as any).MDS.filehost}${
                      link.uid
                    }/index.html?uid=${link.sessionid}#/t/${TXNHASH}`,
                    window.innerWidth < 568 ? "_self" : "_blank"
                  );
                }}
                readOnly
                className="w-30 bg-transparent cursor-pointer hover:opacity-80 focus:outline-none truncate font-mono text-sm font-bold"
                value={
                  !txHashFocusStates[index]
                    ? TXNHASH.substring(0, 8) +
                      "..." +
                      TXNHASH.substring(TXNHASH.length - 8, TXNHASH.length)
                    : TXNHASH
                }
              />
            )}
            {isMinimaEvent && !TXNHASH.includes("0x") && (
              <p className="text-xs text-center">{TXNHASH}</p>
            )}

            {!isEthereumEvent && !isMinimaEvent && (
              <p className="text-xs text-center">{TXNHASH}</p>
            )}
          </>
        )}
      </td>
      <td className="p-4 text-right">
        <div className="text-xs">
          {format(parseInt(EVENTDATE), "MMMM dd, yyyy hh:mm a")}
        </div>
      </td>
    </>
  );
};
const renderCellMobile = (cellData, index, handleFocus, focusStates) => {
  const {
    EVENT,
    EVENTDATE,
    HASH,
    TOKEN,
    AMOUNT,
    TXNHASH,
    getTokenType,
    _network: network,
  } = cellData;

  const isEthereumEvent =
    TXNHASH !== "0x00" && TXNHASH.includes("0x") && TOKEN !== "minima";
  const isMinimaEvent = TXNHASH === "0x00" || TOKEN === "minima";

  return (
    <>
      <div className="p-4 pt-3">
        <input
          onFocus={() => handleFocus(index, "hash")}
          onBlur={() => handleFocus(index, "hash")}
          readOnly
          className="w-30 bg-transparent focus:outline-none truncate font-mono text-sm font-bold"
          value={
            !focusStates[index]
              ? HASH.substring(0, 8) +
                "..." +
                HASH.substring(HASH.length - 8, HASH.length)
              : HASH
          }
        />
      </div>
      <div className="p-4 pt-3">
        {EVENT.includes("WITHDRAW") && (
          <div className="bg-sky-700 rounded-full px-4 w-max py-1 text-white dark:text-black text-xs">
            Withdrew tokens
          </div>
        )}

        {EVENT.includes("STARTED") && (
          <div className="bg-blue-700 rounded-full px-4 w-max py-1  text-white dark:text-black text-xs">
            Created a contract
          </div>
        )}

        {EVENT.includes("SENDETH") && (
          <div className="bg-orange-700 rounded-full px-4 w-max py-1  text-white dark:text-black text-xs">
            Sent ETH / ERC20
          </div>
        )}

        {EVENT.includes("COLLECT") &&
          !TXNHASH.includes("Ran out of ETH, disabled orderbook") && (
            <div className="bg-teal-700 rounded-full px-4 w-max py-1 text-white dark:text-black text-xs">
              Attempted a collect
            </div>
          )}
        {EVENT.includes("COLLECT") &&
          TXNHASH.includes("Ran out of ETH, disabled orderbook") && (
            <div className="bg-red-700 rounded-full px-4 w-max py-1 text-white dark:text-black text-xs">
              Disabled orderbook
            </div>
          )}
        {EVENT.includes("EXPIRED") && (
          <div className="bg-violet-700 rounded-full px-4 w-max py-1  text-white dark:text-black text-xs">
            Contract expired
          </div>
        )}
        {EVENT.includes("SENT") && (
          <div className="bg-teal-700 rounded-full px-4 w-max py-1  text-white dark:text-black text-xs">
            Sent counterparty tokens
          </div>
        )}
        {EVENT.includes("APPROVE") && (
          <div className="bg-yellow-700 rounded-full px-4 w-max py-1  text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
      </div>
      <div className="p-4">
        <div
          className={`${
            TOKEN === "minima" && "!to-blue-500"
          } bg-gradient-to-r from-white dark:from-black to-teal-600 dark:to-teal-500 rounded-full w-max`}
        >
          <img
            className="w-[24px] h-[24px] rounded-full inline-block pl-0.5 pb-0.5"
            src={
              getTokenType(TOKEN) === "wMinima"
                ? "./assets/wtoken.svg"
                : getTokenType(TOKEN) === "Minima"
                ? "./assets/token.svg"
                : "./assets/tether.svg"
            }
          />
          <p className="max-w-xs text-white inline-block my-auto font-mono text-xs px-2">
            {new Decimal(AMOUNT).toString()}
          </p>
        </div>
      </div>
      <div className="p-4 pt-2">
        {EVENT.includes("EXPIRED") ? (
          <p className="text-xs text-center">
            {TXNHASH.includes("SECRET") ? TXNHASH : "-"}
          </p>
        ) : (
          <>
            {isEthereumEvent && (
              <input
                readOnly
                className="w-full bg-transparent cursor-pointer focus:outline-none hover:opacity-80 truncate font-mono text-sm font-bold"
                value={TXNHASH}
                onClick={(e) => {
                  if (window.navigator.userAgent.includes("Minima Browser")) {
                    e.preventDefault();
                    // @ts-ignore
                    Android.openExternalBrowser(
                      network === "mainnet"
                        ? "https://etherscan.io/tx/" + TXNHASH
                        : "https://sepolia.etherscan.io/tx/" + TXNHASH,
                      "_blank"
                    );
                  }

                  window.open(
                    network === "mainnet"
                      ? "https://etherscan.io/tx/" + TXNHASH
                      : "https://sepolia.etherscan.io/tx/" + TXNHASH,
                    "_blank"
                  );
                }}
              />
            )}

            {isMinimaEvent && TXNHASH.includes("0x") && (
              <input
                onClick={async () => {
                  if (TXNHASH === "0x00" || TXNHASH.includes("Incorrect")) {
                    return;
                  }

                  const link = await utils.dAppLink("Block");
                  await new Promise((resolve) => setTimeout(resolve, 150));
                  window.open(
                    `${(window as any).MDS.filehost}${
                      link.uid
                    }/index.html?uid=${link.sessionid}#/t/${TXNHASH}`,
                    window.innerWidth < 568 ? "_self" : "_blank"
                  );
                }}
                readOnly
                className="w-full bg-transparent cursor-pointer hover:opacity-80 focus:outline-none truncate font-mono text-sm font-bold"
                value={TXNHASH}
              />
            )}
            {isMinimaEvent && !TXNHASH.includes("0x") && (
              <p className="text-xs">{TXNHASH}</p>
            )}

            {!isEthereumEvent && !isMinimaEvent && (
              <p className="text-xs">{TXNHASH}</p>
            )}
          </>
        )}
      </div>

      <div className="p-4">
        <div className="text-xs">
          {format(parseInt(EVENTDATE), "MMMM dd, yyyy hh:mm a")}
        </div>
      </div>
    </>
  );
};

const MAX = 20;
const MainActivity = () => {
  const { _promptLogs, promptLogs, _switchLogView } = useContext(appContext);
  const { getTokenType, _network } = useWalletContext();
  const [offset, setOffset] = useState(0);
  const [data, setData] = useState<any[]>([]);

  const [hasMore, setHasMore] = useState(false);

  const springProps = useSpring({
    opacity: _promptLogs ? 1 : 0,
    config: config.gentle,
  });

  const handleNext = () => {
    setOffset((prevState) => prevState + MAX);
  };

  const handlePrev = () => {
    setOffset((prevState) => prevState - MAX);
  };

  useEffect(() => {
    if (_promptLogs && _switchLogView === "all") {
      getAllEvents(MAX + 1, offset, (events) => {
      
        const _evts = events
          .filter((e) => !(e.TXNHASH === "SECRET REVEALED"))
          .map((e) => {
            if (e.TXNHASH.includes("-")) {
              const txHash = e.TXNHASH.split("-")[0];
              return {
                ...e,
                TXNHASH: txHash,
                getTokenType,
                _network,
              };
            }
            return {
              ...e,
              getTokenType,
              _network,
            };
          });

          if (events.length > MAX) {
            setHasMore(true);
            setData(_evts.slice(0, MAX));
          } else {
            setHasMore(false);
            setData(_evts);
          }
      });
    }
  }, [_promptLogs, offset, _switchLogView]);

  return (
    <>
      <span
        onClick={promptLogs}
        className="mr-2 text-xs text-yellow-300 cursor-pointer"
      >
        <ActivityIcon fill="currentColor" />
      </span>
      {_promptLogs &&
        createPortal(
          <animated.div
            style={springProps}
            className="bg-slate-100 dark:bg-[#1B1B1B] fixed top-0 right-0 bottom-0 left-0 grid grid-cols-[1fr_minmax(0,_860px)_1fr] overflow-hidden overflow-y-auto"
          >
            <div className="bg-slate-100 dark:bg-[#1B1B1B]" />
            <div className="overflow-none">
              <div className="flex justify-between items-center pr-4 my-3">
                <Tabs />

                <svg
                  onClick={promptLogs}
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

              {_switchLogView === "all" && (
                <>
                  {!data.length && (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-xs font-bold text-center">
                        No activity yet
                      </p>
                    </div>
                  )}
                  {!!data.length && (
                    <MostResponsiveTableEver
                      headerClasses="border-b"
                      headerClassesMobile="divide-y dark:divide-teal-300"
                      headerCellClassesMobile={[
                        "tracking-wider text-sm p-4 text-teal-600 dark:text-teal-300 font-bold shadow-sm dark:shadow-teal-300 border-l border-t dark:border-teal-300",
                        "tracking-wider text-sm p-4 font-bold",
                        "tracking-wider text-sm p-4 font-bold",
                        "tracking-wider text-sm p-4 font-bold",
                        "tracking-wider text-sm p-4 font-bold",
                        "tracking-wider text-sm p-4 font-bold",
                        "tracking-wider text-sm p-4 font-bold",
                      ]}
                      headerCellClasses={[
                        "tracking-wider font-semibold text-sm p-3 w-10",
                        "tracking-wider font-semibold text-sm p-3 w-40",
                        "tracking-wider font-semibold text-sm p-3 w-40",
                        "tracking-wider font-semibold text-sm p-3 w-20",
                        "tracking-wider font-semibold text-sm p-3 w-40",
                        "tracking-wider font-semibold text-sm p-3 w-40 text-right",
                      ]}
                      headers={["ID", "Event", "Token", "TXNHash", "Timestamp"]}
                      data={data}
                      renderCell={renderCell}
                      renderCellMobile={renderCellMobile}
                    />
                  )}

                  

                  {!!data.length && (hasMore || offset !== 0) && (
                    <div className="grid grid-cols-2 px-4 my-4 gap-3 max-w-sm mx-auto">
                      <button
                        onClick={handlePrev}
                        disabled={offset === 0}
                        type="button"
                        className="bg-black bg-opacity-100 text-white dark:bg-gray-200 dark:text-black dark:bg-opacity-50 disabled:bg-gray-300 disabled:text-gray-600 disabled:font-thin disabled:dark:bg-gray-500 disabled:dark:text-gray-300"
                      >
                        Prev
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={!hasMore}
                        type="button"
                        className="bg-blue-500 dark:text-black font-bold text-white disabled:bg-gray-300 disabled:text-gray-600 disabled:font-thin disabled:dark:bg-gray-500 disabled:dark:text-gray-300"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}

              {_switchLogView === "orders" && <OrderHistory full={true} />}
            </div>
            <div className="bg-slate-100 dark:bg-[#1B1B1B]" />
          </animated.div>,
          document.body
        )}
    </>
  );
};

export default MainActivity;
