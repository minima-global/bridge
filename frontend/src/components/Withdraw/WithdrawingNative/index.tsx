import NativeMinima from "../../NativeMinima";
import Transfer from "../../Transfer";
import { sendMinima } from "../../../../../dapp/js/apiminima.js";
import { logWithdraw } from "../../../../../dapp/js/sql.js";
import { useContext } from "react";
import { appContext } from "../../../AppContext.js";

const WithdrawingNative = () => {
    const { _userDetails, promptWithdraw } = useContext(appContext);

    async function withdrawMinima(amount: string) {    
        
        return new Promise((resolve, reject) => {
            //Get an address
            (window as any).MDS.cmd("getaddress",function(getaddr){
                var address = getaddr.response.miniaddress;
                
                //And send from the native wallet.. no state vars
                sendMinima(_userDetails, amount, address, {}, function(resp) {   
                    console.log('sendMinima response', resp);             
                    if (!resp.status) reject(resp.error ? resp.error : "Failed to send Minima");
    
                    if (resp.status) {                    
                        resolve(true);
                        logWithdraw("minima", amount);
                    }
                });
            });
        });
    }



  return (
    <div className="max-w-sm mx-auto my-4 px-2">
      <NativeMinima display={false} />
      <Transfer type="native" submitForm={withdrawMinima} onCancel={promptWithdraw} />
    </div>
  );
};

export default WithdrawingNative;
