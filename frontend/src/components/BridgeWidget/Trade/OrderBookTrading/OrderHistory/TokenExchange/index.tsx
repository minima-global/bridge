import Token from "../../../../../Token";
import DoubleArrowIcon from "../../../../../UI/Icons/DoubleArrow";

const TokenExchange = ({amount, token, requestamount, requesttoken}) => {

  return (
    <div className="bg-transparent text-black dark:bg-black dark:text-white rounded-lg px-2">
      <div className="grid grid-rows-3 sm:flex items-center gap-2">
        <div className="grid grid-cols-[28px_auto]">
          <Token size={26} token={token} />
          <p className="truncate text-sm my-auto font-mono font-bold ml-2">{amount}</p>
        </div>
        
        <div>
            <DoubleArrowIcon fill="fill-black dark:fill-teal-300" size={22} />
        </div>

        <div className="grid grid-cols-[28px_1fr]">
          <Token size={26} token={requesttoken} />
          <p className="truncate text-sm my-auto font-mono font-bold ml-2">{requestamount}</p>
        </div>
      </div>
      <div />
    </div>
  );
};

export default TokenExchange;
