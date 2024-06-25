import { Data } from "../../../../../../types/Order";

const PricePerToken = ({order, tradingSide, token}) => {

    return <span className="text-xs text-black dark:text-gray-100 dark:text-opacity-50">
        {order &&   
        (order as Data).orderbook &&
        (order as Data).orderbook[token]
         ? "x" +
            (order as Data).orderbook[token][
                tradingSide === "Buy"
               ? "sell"
                : "buy"
            ] +
            " each"
        : null}
    </span>
}


export default PricePerToken;