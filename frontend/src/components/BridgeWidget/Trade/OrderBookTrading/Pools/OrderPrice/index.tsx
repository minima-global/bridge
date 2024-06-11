import { useFormikContext } from "formik";
import { useEffect } from "react";

import { calculateAmount } from "../../../../../../../../dapp/js/orderbookutil.js";
import { calculatePrice } from "../../../../../../../../dapp/js/orderbookutil.js";
import { searchAllorFavsOrderBooks } from "../../../../../../../../dapp/js/orderbookutil.js";

interface IProps {
  orderType: string;
  token: string;
  userPublicKey: string;
}
const OrderPrice = ({orderType, token, userPublicKey}: IProps) => {
  const formik: any = useFormikContext();
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
          userPublicKey,
          function (_, order) {     
            console.log('order found', order);
            setFieldValue("order", order);          
            resolve(order);
          }
        );
      });
      
      if (!order || !order.orderbook) return;
      console.log('order Type', orderType);
      
      if (orderType.toLowerCase() === 'buy') {
        console.log('User wants to buy Native Minima');
      }
      if (orderType.toLowerCase() === 'sell') {
        console.log('User wants to sell Native Minima');
      }
      const orderPrice = calculateAmount(orderType.toLowerCase(), offerPrice, token, order.orderbook);
      const price = calculatePrice(orderType.toLowerCase(),token,order.orderbook);

      console.log('price available', price);

      console.log('I will give', offerPrice);
      console.log('I will receive', orderPrice);
      
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
