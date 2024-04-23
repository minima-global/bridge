import { useContext } from "react";
import { appContext } from "../../AppContext";

const BridgeWidget = () => {
    const {_currentNavigation} = useContext(appContext);

    return <div className="text-center my-4">{_currentNavigation}</div>
}

export default BridgeWidget;