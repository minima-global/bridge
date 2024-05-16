import { useContext } from "react";
import { appContext } from "../../../AppContext";
import QRCode from "react-qr-code";
import WalletAddress from "../WalletAddress";
import ProgressIcon from "../../UI/Progress";

const NativeAddress = () => {
  const { _userDetails } = useContext(appContext);

  if (_userDetails === null) {
    return <ProgressIcon />;
  }
  return (
    <div className="my-4">
      <div className="grid grid-cols-[1fr_auto_1fr]">
        <div />
        <div className="flex flex-col gap-3 items-center">
          {_userDetails &&
            _userDetails.minimaaddress &&
            typeof _userDetails.minimaaddress.mxaddress === "string" && (
              <QRCode
                className="rounded-lg"
                size={200}
                value={_userDetails.minimaaddress.mxaddress}
              />
            )}

          <WalletAddress
            _address={_userDetails.minimaaddress.mxaddress}
            fullAddress
          />
          <p className="text-sm max-w-[236px] text-center">
            Send native Minima to this address
          </p>
        </div>
        <div />
      </div>
    </div>
  );
};

export default NativeAddress;
