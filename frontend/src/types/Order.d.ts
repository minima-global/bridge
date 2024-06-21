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

export interface Data {
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

export interface OrderActivityEvent {
    ID: string;
    HASH: string;
    EVENT: string;
    TOKEN: string;
    AMOUNT: string;
    TXNHASH: string;
    EVENTDATE: string;
}

export interface OrderActivityEventGrouped {
    [key: string]: OrderActivityEvent[]; 
}