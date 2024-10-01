import Transfer from "../../Transfer";
import { sendBackendMSG } from "../../../../../dapp/js/jslib.js";
import { _defaults } from "../../../constants/index.js";

const WithdrawingERC20 = () => {

    async function withdrawToken({amount, action, address}) {    
        return new Promise((resolve) => {
            const message = {
                amount,
                address,
                action
            }

            sendBackendMSG(message, (resp) => {
                resolve(resp);
            });
        });
    }


  return (
    <div className="max-w-sm mx-auto my-4 px-2">
        <Transfer type="erc20" submitForm={withdrawToken} />
    </div>
  );
};

export default WithdrawingERC20;
