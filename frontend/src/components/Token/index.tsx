import { useWalletContext } from "../../providers/WalletProvider/WalletProvider";

// Minima, wMinima, USDT, Other
interface IProps {
  token: string;
  size?: number;
}
const Token = ({ token, size = 36 }: IProps) => {
  const { getTokenType, _network } = useWalletContext();

  if (!token) {
    return null;
  }

  return (
    <div className={`max-w-[${size}px]`}>
      {getTokenType(token, _network) === "wMinima" && (
        <img
          alt="token-icon"
          src="./assets/wtoken.svg"
          className={`!w-[${size}px] !h-[${size}px] rounded-full`}
        />
      )}
      {getTokenType(token, _network) === "Tether" && (
        <img
          alt="token-icon"
          src="./assets/tether.svg"
          className={`!w-[${size}px] !h-[${size}px] rounded-full`}
        />
      )}
      {getTokenType(token, _network) === "Minima" && (
        <img
          alt="token-icon"
          src="./assets/token.svg"
          className={`!w-[${size}px] !h-[${size}px] rounded-full`}
        />
      )}
      {getTokenType(token, _network) === "Other" && (
        <img
          alt="token-icon"
          src="./assets/token.svg"
          className={`!w-[${size}px] !h-[${size}px] rounded-full`}
        />
      )}
    </div>
  );
};

export default Token;
