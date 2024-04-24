import { useContext } from "react";
import { appContext } from "../../../AppContext";
import QRCode from "react-qr-code";
import WalletAddress from "../WalletAddress";
import ProgressIcon from "../../UI/Progress";

const EthereumAddress = () => {
  const { _userDetails } = useContext(appContext);

  if (_userDetails === null) {
    return <ProgressIcon />;
  }

  return (
    <div className="my-4">
      <div className="grid grid-cols-[1fr_auto_1fr]">
        <div />
        <div className="flex flex-col gap-3 items-center">
          <QRCode
            className="rounded-lg"
            size={200}
            value={_userDetails.ethaddress}
          />

          <WalletAddress _address={_userDetails.ethaddress} fullAddress />
          <p className="text-sm max-w-[236px] text-center">Send Ethereum and ERC-20 tokens to this address <br/> (e.g wMINIMA/USDT)</p>
        </div>
        <div />
      </div>
    </div>
  );
};

export default EthereumAddress;
