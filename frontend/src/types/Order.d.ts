interface Orderbook {
    enable: boolean;
    buy: number;
    sell: number;
    minimum: number;
    maximum: number;
}

interface Balance {
    total: number;
}

interface Data {
    publickey: string;
    ethpublickey: string;
    orderbook: {
        wminima: Orderbook;
        usdt: Orderbook;
    };
    balance: {
        minima: Balance;
        eth: number;
        wminima: number;
        usdt: number;
    };
}

export interface Order {
    maximapublickey: string;
    data: Data;
}