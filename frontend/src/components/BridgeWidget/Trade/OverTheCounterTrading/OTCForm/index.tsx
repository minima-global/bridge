import InputWrapper from "../../../../UI/FormComponents/InputWrapper";
import FavoriteIcon from "../../../../UI/FavoriteIcon";
import NativeMinima from "../../../../NativeMinima";
import EthereumTokenSelect from "../EthereumTokenSelect";

const OTCForm = () => {

  return (
    <form>
      <InputWrapper
        inputProps={{ placeholder: "uid" }}
        action={
          <button
            type="button"
            className="hover:animate-pulse text-sm flex items-center"
          >
            <FavoriteIcon fill="currentColor" />
          </button>
        }
        label="Your Counterparty"
      />

      <InputWrapper
        wrapperStyle="mt-2"
        inputProps={{ placeholder: "0.0" }}
        label="Native Offering"
        action={ 
            <div className="pr-1 pt-1">
                <NativeMinima display={true} />
            </div>         
        }
      />
      
      <InputWrapper
        wrapperStyle="mt-2"
        inputProps={{ placeholder: "0.0" }}
        label="Requesting Amount"
        action={          
            <EthereumTokenSelect token="Tether" setToken={() => null} />
        }
      />

      <button className="mt-4 w-full bg-orange-600 font-bold dark:text-black">Trade</button>
    </form>
  );
};

export default OTCForm;
