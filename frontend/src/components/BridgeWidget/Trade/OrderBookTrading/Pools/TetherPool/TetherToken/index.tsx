import Decimal from "decimal.js";
import { useTokenStoreContext } from "../../../../../../../providers/TokenStoreProvider";
import { formatUnits } from "ethers";
import { useWalletContext } from "../../../../../../../providers/WalletProvider/WalletProvider";

const TetherToken = () => {
  const { tokens } = useTokenStoreContext();
  const { _network } = useWalletContext();
  const relevantToken = tokens.find((t) => t.name === "Tether");
  return (
    <>
      <img
        alt="token"
        src="./assets/tether.svg"
        className="rounded-full w-[36px] h-[36px] my-auto"
      />
      
      <p className="text-xs text-center font-bold font-mono truncate">
        {relevantToken &&
          new Decimal(
            formatUnits(relevantToken!.balance, _network === 'sepolia' ? 18 : relevantToken!.decimals)
          ).toFixed(0)}
      </p>
    </>
  );
};

export default TetherToken;
