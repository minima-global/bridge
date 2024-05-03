import { useContext, useEffect, useState } from "react";
import MostResponsiveTableEver from "../../../../UI/MostResponsiveTableEver";
import {
  checkForCurrentSwaps,
  getCoinHTLCData,
} from "../../../../../../../dapp/js/apiminima.js";
import { haveSentCounterPartyTxn } from "../../../../../../../dapp/js/sql.js";
import { appContext } from "../../../../../AppContext.js";
import Decimal from "decimal.js";

const headers = ["UID", "Native", "Request", "TimeLock", "Action"];

const getReceiversActions = async (coin) => {
  return new Promise((resolve) => {
    if (new Decimal(coin.age).lt(2)) {
      resolve("PENDING");
    } else {
      const hashlock = getCoinHTLCData(coin, "hashlock");
      haveSentCounterPartyTxn(hashlock, (sent) => {
        if (!sent) resolve("ACCEPT");

        return resolve("ACCEPTED");
      });
    }
  });
};

const renderCell = (cellData) => {
  const { uid, native, token, timelock, action, coinid } = cellData;
  const [_timeLock, setTimeLock] = useState<null | string>(null);
  const { _currentBlock, promptAcceptOTC } = useContext(appContext);
  useEffect(() => {
    setTimeLock(
      timelock && _currentBlock
        ? new Decimal(timelock).minus(_currentBlock).toString()
        : null
    );
  }, [_currentBlock]);

  return (
    <>
      <td className="p-3">
        <input
          readOnly
          className="w-20 bg-transparent focus:outline-none truncate font-mono text-sm font-bold"
          value={uid}
        />
      </td>
      <td className="p-3">
        <input
          readOnly
          className="w-20 bg-transparent focus:outline-none truncate font-mono text-sm text-center"
          value={native}
        />
      </td>

      <td className="p-3">
        <div className="bg-gradient-to-r from-white dark:from-black to-teal-600 dark:to-teal-500 rounded-full w-max">
          <img
            className="w-[24px] h-[24px] rounded-full inline-block pl-0.5 pb-0.5"
            src={
              token.tokenName === "wMinima"
                ? "./assets/token.svg"
                : "./assets/tether.svg"
            }
          />
          <p className="max-w-xs text-white inline-block my-auto font-mono text-xs px-2">
            {token.amount}
          </p>
        </div>
      </td>
      <td className="p-3">
        <input
          readOnly
          className="bg-transparent w-10 focus:outline-none truncate font-mono text-sm text-center"
          value={_timeLock && new Decimal(_timeLock).gt(0) ? _timeLock : "-"}
        />
      </td>
      <td className="p-3 w-40">
        {action === "LOCKED" && (
          <p className="bg-yellow-300 mx-auto tracking-wider rounded-full px-4 w-max text-xs py-2 text-black font-bold">
            LOCKED
          </p>
        )}
        {action === "ACCEPT" && (
          <button
            onClick={() => promptAcceptOTC({ uid, native, token, timelock, action, coinid })}
            type="button"
            className="bg-teal-300 py-1 text-black hover:bg-opacity-80 font-bold w-full"
          >
            Accept
          </button>
        )}
        {action === "ACCEPTED" && (
          <div className="bg-teal-400 mx-auto py-2 flex items-center px-3 rounded-full w-max">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="none"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"
                stroke-width="0"
                fill="#0d9488"
              />
            </svg>
            <p className="rounded-full tracking-wider pl-1 w-max text-xs text-white dark:text-black font-bold">
              Accepted
            </p>
          </div>
        )}
        {action === "PENDING" && (
          <div className="mx-auto bg-yellow-500 rounded-full px-4 w-max py-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="animate-spin"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="#FFFFFF"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" />
              <path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" />
              <path d="M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" />
              <path d="M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" />
              <path d="M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" />
              <path d="M12 9l-2 3h4l-2 3" />
            </svg>
          </div>
        )}
      </td>
    </>
  );
};
const renderCellMobile = (cellData) => {
  const { uid, native, token, timelock, action, coinid } = cellData;
  const [_timeLock, setTimeLock] = useState<null | string>(null);
  const { _currentBlock, promptAcceptOTC } = useContext(appContext);

  useEffect(() => {
    setTimeLock(
      timelock && _currentBlock
        ? new Decimal(timelock).minus(_currentBlock).toString()
        : null
    );
  }, [_currentBlock]);

  return (
    <>
      <div className="p-4 pt-3">
        <input
          readOnly
          className="w-full bg-transparent focus:outline-none truncate font-mono text-xs font-bold"
          value={uid}
        />
      </div>
      <div className="p-4 pt-3">
        <input
          readOnly
          className="bg-transparent focus:outline-none truncate font-mono text-xs"
          value={native}
        />
      </div>

      <div className="p-4">
        <div className="bg-gradient-to-r from-white dark:from-black to-teal-600 dark:to-teal-500 rounded-full w-max">
          <img
            className="w-[24px] h-[24px] rounded-full inline-block pl-0.5 pb-0.5"
            src={
              token.tokenName === "wMinima"
                ? "./assets/token.svg"
                : "./assets/tether.svg"
            }
          />
          <p className="max-w-xs text-white inline-block my-auto font-mono text-xs px-2">
            {token.amount}
          </p>
        </div>
      </div>
      <div className="p-4 pt-2">
        <input
          readOnly
          className="bg-transparent w-full focus:outline-none truncate font-mono text-xs"
          value={_timeLock && new Decimal(_timeLock).gt(0) ? _timeLock : "-"}
        />
      </div>
      <div className={`p-4 ${action === "!ACCEPT" ? "pt-0" : "pt-3"}`}>
        {action === "LOCKED" && (
          <p className="bg-yellow-300 tracking-wider rounded-full px-4 w-max text-xs py-2 text-black font-bold">
            LOCKED
          </p>
        )}
        {action === "ACCEPT" && (
          <button
            onClick={() => promptAcceptOTC({ uid, native, token, timelock, action, coinid })}
            type="button"
            className="bg-teal-300 text-black hover:bg-opacity-80 font-bold w-full"
          >
            Accept
          </button>
        )}
        {action === "ACCEPTED" && (
          <div className="bg-teal-400 py-2 flex items-center px-3 rounded-full w-max">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="none"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path
                d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.293 5.953a1 1 0 0 0 -1.32 -.083l-.094 .083l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.403 1.403l.083 .094l2 2l.094 .083a1 1 0 0 0 1.226 0l.094 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z"
                stroke-width="0"
                fill="#0d9488"
              />
            </svg>
            <p className="rounded-full tracking-wider pl-1 w-max text-xs text-white dark:text-black font-bold">
              Accepted
            </p>
          </div>
        )}
        {action === "PENDING" && (
          <div className="bg-yellow-500 rounded-full px-4 w-max py-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="animate-spin"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="#FFFFFF"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M10 20.777a8.942 8.942 0 0 1 -2.48 -.969" />
              <path d="M14 3.223a9.003 9.003 0 0 1 0 17.554" />
              <path d="M4.579 17.093a8.961 8.961 0 0 1 -1.227 -2.592" />
              <path d="M3.124 10.5c.16 -.95 .468 -1.85 .9 -2.675l.169 -.305" />
              <path d="M6.907 4.579a8.954 8.954 0 0 1 3.093 -1.356" />
              <path d="M12 9l-2 3h4l-2 3" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
};

// Activity can be loading, Locked, Accept or Accepted
const Activity = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const { _currentBlock } = useContext(appContext);
  const [_, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    checkForCurrentSwaps(true, async (swaps) => {
      const ownerDeals = swaps.owner.map((c) => ({
        uid: getCoinHTLCData(c, "owner"),
        coinid: c.coinid,
        native: getCoinHTLCData(c, "amount"),
        timelock: getCoinHTLCData(c, "timelock"),
        token: {
          tokenName: getCoinHTLCData(c, "requesttokentype"),
          amount: getCoinHTLCData(c, "requestamount"),
        },
        action: "LOCKED",
      }));

      const receiverDeals = await Promise.all(
        swaps.receiver.map(async (c) => ({
          uid: getCoinHTLCData(c, "owner"),
          coinid: c.coinid,
          native: getCoinHTLCData(c, "amount"),
          timelock: getCoinHTLCData(c, "timelock"),
          token: {
            tokenName: getCoinHTLCData(c, "requesttokentype"),
            amount: getCoinHTLCData(c, "requestamount"),
          },
          action: await getReceiversActions(c),
        }))
      );

      setDeals([...ownerDeals, ...receiverDeals]);

      setLoading(false);
    });
  }, [_currentBlock]);

  return (
    <div className="bg-gray-100 bg-opacity-50 dark:bg-opacity-100 dark:bg-[#1B1B1B] overflow-auto rounded-lg">
      {!!deals.length && (
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
          ]}
          headerCellClasses={[
            "tracking-wider font-semibold text-sm p-3 w-20",
            "tracking-wider font-semibold text-sm p-3 w-20",
            "tracking-wider font-semibold text-sm p-3 w-40",
            "tracking-wider font-semibold text-sm p-3 w-20",
            "tracking-wider font-semibold text-sm p-3 w-40 text-right",
          ]}
          headers={headers}
          data={deals}
          renderCell={renderCell}
          renderCellMobile={renderCellMobile}
        />
      )}

      {!deals.length && (
        <div className="flex justify-center items-center h-full">
          <p className="text-sm !text-opacity-30 dark:text-white py-16 md:py-0">
            No active deals
          </p>
        </div>
      )}
    </div>
  );
};

export default Activity;
