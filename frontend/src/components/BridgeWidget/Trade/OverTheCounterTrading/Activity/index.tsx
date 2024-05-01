import MostResponsiveTableEver from "../../../../UI/MostResponsiveTableEver";

interface Props {
  data: any[];
}

const headers = ["UID", "Native", "Request", "TimeLock", "Action"];
const fakeData = [
  {
    uid: "0x7775C567A42978C72F4BEB79D3139CC72354B0895C0E836BBA3F8EEDC3F8B042",
    native: "100",
    token: {
      tokenName: "wMinima",
      amount: "200",
    },
    timelock: "150",
    action: "Locked",
  },
  {
    uid: "0x1234567890123456789012345678901234567890123456789012345678901234",
    native: "150",
    token: {
      tokenName: "wEth",
      amount: "300",
    },
    timelock: "200",
    action: "Unlocked",
  },
  {
    uid: "0xAABBCCDDEEFFAABBCCDDEEFFAABBCCDDEEFFAABBCCDDEEFFAABBCCDDEEFFAA",
    native: "200",
    token: {
      tokenName: "wBTC",
      amount: "400",
    },
    timelock: "250",
    action: "Locked",
  },
];

type ACTION_STATES = "LOADING" | "LOCKED" | "ACCEPT" | "ACCEPTED";

const renderCell = (cellData) => {
  const { uid, native, token, timelock, action } = cellData;

  return (
    <>
      <td className="p-3">
        <input
          className="w-20 bg-transparent focus:outline-none truncate font-mono text-sm font-bold"
          value={uid}
        />
      </td>
      <td className="p-3">
        <input
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
          className="w-full bg-transparent focus:outline-none truncate font-mono text-xs font-bold"
          value={uid}
        />
      </div>
      <div className="p-4 pt-3">
        <input
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
const Activity = ({ data }: Props) => {
  return (
    <div className="bg-gray-100 bg-opacity-50 dark:bg-opacity-100 dark:bg-[#1B1B1B] overflow-auto rounded-lg">
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
        data={fakeData}
        renderCell={renderCell}
        renderCellMobile={renderCellMobile}
      />

      {/* <div className="flex justify-center items-center h-full">
        {!data.length && <p className="text-white text-opacity-30">No active deals</p>}
      </div> */}
    </div>
  );
};

export default Activity;
