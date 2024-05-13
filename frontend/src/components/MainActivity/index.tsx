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

const renderCell = (cellData) => {
  const {
    ID,
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
          readOnly
          className="w-10 bg-transparent focus:outline-none truncate font-mono text-sm font-bold"
          value={ID}
        />
      </td>
      <td className="p-3">
        {EVENT.includes("STARTED") && (
          <div className="bg-blue-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
        {EVENT.includes("COLLECT") && (
          <div className="bg-teal-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
        {EVENT.includes("EXPIRED") && (
          <div className="bg-violet-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
        {EVENT.includes("SENT") && (
          <div className="bg-teal-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
        {EVENT.includes("APPROVE") && (
          <div className="bg-yellow-700 rounded-full px-4 w-max py-1 mx-auto text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
      </td>

      <td className="p-3">
        <input
          readOnly
          className="w-40 bg-transparent focus:outline-none truncate font-mono text-xs text-center"
          value={HASH}
        />
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
              getTokenType(TOKEN) === "wMinima" ||
              getTokenType(TOKEN) === "Minima"
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
        {isEthereumEvent && (
          <a
            className="text-xs text-violet-600"
            target="_blank"
            href={`${
              network === "mainnet"
                ? "https://etherscan.io/tx/" + TXNHASH
                : "https://sepolia.etherscan.io/tx/" + TXNHASH
            }`}
          >
            {TXNHASH.substring(0, 10)}...
          </a>
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
                `${(window as any).MDS.filehost}${link.uid}/index.html?uid=${
                  link.sessionid
                }`,
                window.innerWidth < 568 ? "_self" : "_blank"
              );
            }}
            readOnly
            className="w-20 cursor-pointer hover:text-opacity-80 text-orange-600 text-xs bg-transparent focus:outline-none truncate font-mono text-center"
            value={TXNHASH}
          />
        )}
        {isMinimaEvent && !TXNHASH.includes("0x") && (
          <p className="text-xs text-center">{TXNHASH}</p>
        )}

        {!isEthereumEvent && !isMinimaEvent && (
          <p className="text-xs text-center">{TXNHASH}</p>
        )}
      </td>
      <td className="p-4 text-right">
        <div className="text-sm">
          {format(parseInt(EVENTDATE), "MMMM dd, yyyy hh:mm a")}
        </div>
      </td>
    </>
  );
};
const renderCellMobile = (cellData) => {
  const {
    ID,
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
          readOnly
          className="w-full bg-transparent focus:outline-none truncate font-mono text-xs font-bold"
          value={ID}
        />
      </div>
      <div className="p-4 pt-3">
        {EVENT.includes("STARTED") && (
          <div className="bg-blue-700 rounded-full px-4 w-max py-1 text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
        {EVENT.includes("COLLECT") && (
          <div className="bg-teal-700 rounded-full px-4 w-max py-1 text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
        {EVENT.includes("EXPIRED") && (
          <div className="bg-violet-700 rounded-full px-4 w-max py-1 text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
        {EVENT.includes("SENT") && (
          <div className="bg-teal-700 rounded-full px-4 w-max py-1 text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
        {EVENT.includes("APPROVE") && (
          <div className="bg-yellow-700 rounded-full px-4 w-max py-1 text-white dark:text-black text-xs">
            {EVENT}
          </div>
        )}
      </div>
      <div className="p-4 pt-3">
        <input
          readOnly
          className="w-full bg-transparent focus:outline-none truncate font-mono text-xs text-center"
          value={HASH}
        />
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
              getTokenType(TOKEN) === "wMinima" ||
              getTokenType(TOKEN) === "Minima"
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
        {isEthereumEvent && (
          <a
            className="text-xs text-violet-600"
            target="_blank"
            href={`${
              network === "mainnet"
                ? "https://etherscan.io/tx/" + TXNHASH
                : "https://sepolia.etherscan.io/tx/" + TXNHASH
            }`}
          >
            {TXNHASH}
          </a>
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
                `${(window as any).MDS.filehost}${link.uid}/index.html?uid=${
                  link.sessionid
                }`,
                window.innerWidth < 568 ? "_self" : "_blank"
              );
            }}
            readOnly
            className="cursor-pointer hover:text-opacity-80 text-orange-600 text-xs bg-transparent focus:outline-none w-full truncate font-mono"
            value={TXNHASH}
          />
        )}
        {isMinimaEvent && !TXNHASH.includes("0x") && (
          <p className="text-xs">{TXNHASH}</p>
        )}

        {!isEthereumEvent && !isMinimaEvent && (
          <p className="text-xs">{TXNHASH}</p>
        )}
      </div>

      <div className="p-4">
        <div className="text-sm">
          {format(parseInt(EVENTDATE), "MMMM dd, yyyy hh:mm a")}
        </div>
      </div>
    </>
  );
};

const MAX = 20;
const MainActivity = () => {
  const { _promptLogs, promptLogs } = useContext(appContext);
  const { getTokenType, _network } = useWalletContext();

  const [data, setData] = useState<any[]>([]);

  const springProps = useSpring({
    opacity: _promptLogs ? 1 : 0,
    config: config.gentle,
  });

  useEffect(() => {
    if (_promptLogs) {
      getAllEvents(MAX, 0, (events) => {
        const _evts = events.map((event) => ({
          ...event,
          getTokenType,
          _network,
        }));

        setData(_evts);
      });
    }
  }, [_promptLogs]);

  return (
    <>
      <span onClick={promptLogs} className="mr-2 text-xs text-yellow-300 cursor-pointer">
        <ActivityIcon fill="currentColor" />
      </span>
      {_promptLogs &&
        createPortal(
          <animated.div
            style={springProps}
            className="bg-slate-200 dark:bg-[#1B1B1B] fixed top-0 right-0 bottom-0 left-0 overflow-y-scroll grid grid-cols-[1fr_minmax(0,_860px)_1fr]"
          >
            <div className="bg-slate-100 dark:bg-black" />
            <div className="overflow-scroll">
              <div className="flex justify-between items-center pr-4 my-3">
                <h3 className="font-bold ml-4">Activity Logs</h3>
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

              <MostResponsiveTableEver
                headerClasses=""
                headerClassesMobile="divide-y dark:divide-teal-300"
                headerCellClassesMobile={[
                  "tracking-wider text-sm p-4 text-teal-600 dark:text-teal-300 font-bold shadow-sm dark:shadow-teal-300 border-l border-t dark:border-teal-300",
                  "tracking-wider text-sm p-4 font-bold",
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
                  "tracking-wider font-semibold text-sm p-3 w-[25px]",
                  "tracking-wider font-semibold text-sm p-3 w-40",
                  "tracking-wider font-semibold text-sm p-3 w-20",
                  "tracking-wider font-semibold text-sm p-3 w-40",
                  "tracking-wider font-semibold text-sm p-3 w-40 text-right",
                ]}
                headers={[
                  "ID",
                  "Event",
                  "HashLock",
                  "Token",
                  "TXNHash",
                  "Timestamp",
                ]}
                data={data}
                renderCell={renderCell}
                renderCellMobile={renderCellMobile}
              />
            </div>
            <div className="bg-slate-100 dark:bg-black" />
          </animated.div>,
          document.body
        )}
    </>
  );
};

export default MainActivity;
