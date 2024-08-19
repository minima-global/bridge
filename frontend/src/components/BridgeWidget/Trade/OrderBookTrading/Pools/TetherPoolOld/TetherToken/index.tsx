import Decimal from "decimal.js";
import { useTokenStoreContext } from "../../../../../../../providers/TokenStoreProvider";
import { formatUnits } from "ethers";
import { useWalletContext } from "../../../../../../../providers/WalletProvider/WalletProvider";
import RefreshIcon from "../../../../../../UI/Icons/RefreshIcon";
interface Props {
  extraClass?: string;
}
const TetherToken = ({extraClass}: Props) => {
  const { tokens } = useTokenStoreContext();
  const { _network } = useWalletContext();
  const relevantToken = tokens.find((t) => t.name === "Tether");
  
  return (
    <div className={`flex items-center gap-2 ${extraClass ? extraClass : ''}`}>
      <p className="font-mono text-sm truncate bg-transparent focus:outline-none">
        {!relevantToken && <span className="text-black dark:text-teal-300"><RefreshIcon extraClass="w-[12px] h-[16px] mx-auto animate-spin" fill="currentColor" /></span>}
        {relevantToken &&
          new Decimal(
            formatUnits(relevantToken!.balance, _network === 'sepolia' ? 18 : relevantToken!.decimals)
          ).toFixed(0)}
      </p>
      <img
        alt="token"
        src="./assets/tether.svg"
        className="rounded-full w-[36px] h-[36px] my-auto"
      />
      
    </div>
  );
};

export default TetherToken;
