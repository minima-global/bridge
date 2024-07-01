import { useFormikContext } from "formik";
import { useContext, useEffect } from "react";

import { calculateAmount } from "../../../../../../../../dapp/js/orderbookutil.js";
import { searchAllorFavsOrderBooks } from "../../../../../../../../dapp/js/orderbookutil.js";
import { appContext } from "../../../../../../AppContext.js";


interface IProps {
  orderType: string;
  token: string;
}
const OrderPrice = ({orderType, token}: IProps) => {
  const formik: any = useFormikContext();
  const { _userDetails } = useContext(appContext);
  const { setFieldValue } = formik;
  const { offerPrice, orderPrice, favorites } = formik.values;

  useEffect(() => {
    if (!offerPrice) return;

    (async () => {
      const order: any = await new Promise((resolve) => {
        searchAllorFavsOrderBooks(
          favorites,
          orderType.toLowerCase(),
          offerPrice,
          token,
          _userDetails.minimapublickey,
          function (_, order) {     
            setFieldValue("order", order);          
            resolve(order);
          }
        );
      });

      
      if (!order || !order.orderbook) return;
      
      const orderPrice = calculateAmount(orderType.toLowerCase(), offerPrice, token, order.orderbook);
      
      if (!isNaN(orderPrice)) {
          setFieldValue("orderPrice", orderPrice);
      } else {
          setFieldValue("orderPrice", 0);
      }
    })();
  }, [offerPrice, orderType]);

  return (
    <input
      readOnly
      id="orderPrice"
      name="orderPrice"
      value={orderPrice}
      className="w-full bg-transparent focus:outline-none font-mono"
      placeholder="Order price"
    />
  );
};

export default OrderPrice;
