import Transfer from "../../Transfer";
import { sendBackendMSG } from "../../../../../dapp/js/jslib.js";
import { useContext } from "react";
import { appContext } from "../../../AppContext.js";
import { _defaults } from "../../../constants/index.js";
import InfoTooltip from "../../UI/InfoTooltip/index.js";

const WithdrawingERC20 = () => {
    const {  promptWithdraw } = useContext(appContext);


    async function withdrawToken({amount, action, address}) {    
        
        return new Promise((resolve) => {
            const message = {
                amount,
                address,
                action
            }

            sendBackendMSG(message, (resp) => {
                // console.log(resp);
                resolve(resp);
            });
        });
    }

    



  return (
    <div className="max-w-sm mx-auto my-4 px-2">
        <div className="flex items-end justify-end"><InfoTooltip message="Your withdrawal will be sent to your node's ETH Wallet." /></div>    
      <Transfer type="erc20" submitForm={withdrawToken} onCancel={promptWithdraw} />
    </div>
  );
};

export default WithdrawingERC20;
