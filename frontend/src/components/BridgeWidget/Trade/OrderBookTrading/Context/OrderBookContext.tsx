import { createContext, useContext, useState } from 'react';
/**
 * Provides Context to the order book, 
 * what side are we on (buying/selling)
 * what pool are we on.. etc..
 */

interface ProviderContext {
    orderContext: OrderContext;
    setOrderContext: React.Dispatch<React.SetStateAction<OrderContext>>;
}

interface OrderContext {
    action: 'buy' | 'sell' | null;
    pool: 'wminima' | 'usdt' | null;
}

const OrderContext = createContext<ProviderContext | null>(null);

export const useOrderContext = () => useContext(OrderContext);

export const OrderBookProvider = ({ children }) => {
  const [orderContext, setOrderContext] = useState<OrderContext>({ action: null, pool: null });

  return (
    <OrderContext.Provider value={{ orderContext, setOrderContext }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrderBookContext = () => {
    const context = useContext(OrderContext);
  
    if (!context)
      throw new Error(
        "OrderContext must be called from within the OrderBookProvider"
      );
  
    return context;
  };