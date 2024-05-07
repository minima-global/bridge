interface RequestToken {
    tokenName: string;
    amount: string;
}

export interface OTCDeal {
    uid: string;
    native: string;
    token: RequestToken;
    timelock: string;
    action: string;
    coinid: string;
}