export type PoolType = {
  enable: boolean;
  buy: number;
  sell: number;
  minimum: number;
  maximum: number;
};

export type PoolData = {
  wminima: PoolType;
  usdt: PoolType;
};
