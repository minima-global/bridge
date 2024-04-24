

export interface Network {    
    chainId: string;
    rpc: string;
    symbol: string;
    name: string;
}


export interface Networks {
    [key: string]: Network;
}
  
