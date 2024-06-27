import { searchAllorFavsOrderBooks } from "../../../../../../../../../dapp/js/orderbookutil.js";
import { calculateAmount } from "../../../../../../../../../dapp/js/orderbookutil.js";

export const matchOrder = async (
  favorites: boolean,
  orderType: "buy" | "sell",
  inputAmount: string,
  token: "usdt" | "wminima",
  ourPublicKey: string
): Promise<{orderPrice: number, order: any} | null> => {
  try {
    const order: any = await new Promise((resolve) => {
      searchAllorFavsOrderBooks(
        favorites,
        orderType,
        inputAmount,
        token,
        ourPublicKey,
        function (_, order) {          
          resolve(order);
        }
      );
    });

    const orderPrice = calculateAmount(
      orderType,
      inputAmount,
      token,
      order.orderbook
    );

    return {order, orderPrice};
  } catch (error) {
    return null;
  }
};

export default matchOrder;
