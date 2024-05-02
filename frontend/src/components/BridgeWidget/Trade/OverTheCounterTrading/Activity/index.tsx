import { useEffect, useState } from "react";
import MostResponsiveTableEver from "../../../../UI/MostResponsiveTableEver";
import { checkForCurrentSwaps, getCoinHTLCData } from"../../../../../../../dapp/js/apiminima.js";

const headers = ["UID", "Native", "Request", "TimeLock", "Action"];
// const fakeData = [
//   {
//     uid: "0x7775C567A42978C72F4BEB79D3139CC72354B0895C0E836BBA3F8EEDC3F8B042",
//     native: "100",
//     token: {
//       tokenName: "wMinima",
//       amount: "200",
//     },
//     timelock: "150",
//     action: "Locked",
//   },
//   {
//     uid: "0x1234567890123456789012345678901234567890123456789012345678901234",
//     native: "150",
//     token: {
//       tokenName: "wEth",
//       amount: "300",
//     },
//     timelock: "200",
//     action: "Unlocked",
//   },
//   {
//     uid: "0xAABBCCDDEEFFAABBCCDDEEFFAABBCCDDEEFFAABBCCDDEEFFAABBCCDDEEFFAA",
//     native: "200",
//     token: {
//       tokenName: "wBTC",
//       amount: "400",
//     },
//     timelock: "250",
//     action: "Locked",
//   },
// ];

// type ACTION_STATES = "LOADING" | "LOCKED" | "ACCEPT" | "ACCEPTED";

const renderCell = (cellData) => {
  const { uid, native, token, timelock, action } = cellData;

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
            src="/assets/tether.svg"
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
          value={timelock}
        />
      </td>
      <td className="p-3 w-40">
        <p className="my-auto text-right text-xs">{action}</p>
      </td>
    </>
  );
};
const renderCellMobile = (cellData) => {
  const { uid, native, token, timelock, action } = cellData;

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
            src="/assets/tether.svg"
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
          value={timelock}
        />
      </div>
      <div className="p-4 pt-5">
        <p className="my-auto text-xs">{action}</p>
      </div>
    </>
  );
};


// Activity can be loading, Locked, Accept or Accepted
const Activity = () => {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    checkForCurrentSwaps(true, (swaps) => {
      console.log(swaps);

      const ownerDeals = swaps.owner.map(c => ({
        uid: getCoinHTLCData(c, "owner"),
        native: getCoinHTLCData(c, "amount"),
        token: {
          tokenName: getCoinHTLCData(c, "requesttokentype"),
          amount: getCoinHTLCData(c, "requestamount")
        }        
      }));
      
      const receiverDeals = swaps.receiver.map(c => ({
        uid: getCoinHTLCData(c, "owner"),
        native: getCoinHTLCData(c, "amount"),
        token: {
          tokenName: getCoinHTLCData(c, "requesttokentype"),
          amount: getCoinHTLCData(c, "requestamount")
        }
      }));
      console.log('ownerDeals', ownerDeals);
      console.log('receiverDeals', receiverDeals);

      setDeals([...ownerDeals, ...receiverDeals]);
    });
  }, []);

  console.log(deals.length);

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
          <p className="text-sm !text-opacity-30 dark:text-white py-16 md:py-0">No active deals</p>
        </div>
      )}
    </div>
  );
};

export default Activity;
