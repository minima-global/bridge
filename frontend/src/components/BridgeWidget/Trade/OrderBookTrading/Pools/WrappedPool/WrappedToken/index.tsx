import Decimal from "decimal.js";
import { useTokenStoreContext } from "../../../../../../../providers/TokenStoreProvider";
import { formatUnits } from "ethers";

const WrappedToken = () => {
  const { tokens } = useTokenStoreContext();
  const relevantToken = tokens.find((t) => t.name === "wMinima");
  return (
    <>
      <img
        alt="token"
        src="./assets/wtoken.svg"
        className="rounded-full w-[36px] h-[36px] my-auto"
      />
      
      <p className="text-xs text-center font-bold font-mono truncate">
        {relevantToken &&
          new Decimal(
            formatUnits(relevantToken!.balance, relevantToken!.decimals)
          ).toFixed(0)}
      </p>
    </>
  );
};

export default WrappedToken;
