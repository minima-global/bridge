import { useContext } from "react"
import { appContext } from "../../../AppContext"

const Balance = () => {
    const { _currentNavigation } = useContext(appContext);



    if (_currentNavigation !== 'balance') {
        return null;
    }

    return <div>
        <div>Native/ERC20</div>


    </div>
}

export default Balance;