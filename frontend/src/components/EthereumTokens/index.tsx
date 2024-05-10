import { _defaults } from "../../constants";

interface IProps {
  externalEthereum: number;
  externalUSDT: number;
  externalWMINIMA: number;
}
const EthereumTokens = ({
  externalEthereum,
  externalUSDT,
  externalWMINIMA,
}: IProps) => {
  return (
    <div>
      <ul>
        <>
          <li
            key="WMINIMA"
            className="grid grid-cols-[auto_1fr] bg-white items-center rounded-md dark:bg-[#1B1B1B] bg-opacity-30 dark:bg-opacity-10 p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2"
          >
            <img
              alt="token-icon"
              src="./assets/wtoken.svg"
              className="w-[36px] h-[36px] rounded-full"
            />

            <div className="flex justify-between ml-2">
              <div>
                <h3 className="font-bold">wMinima</h3>
                <p className="font-mono text-sm">{externalWMINIMA}</p>
              </div>
            </div>
          </li>
          <li
            key="USDT"
            className="grid grid-cols-[auto_1fr] bg-white items-center rounded-md dark:bg-[#1B1B1B] bg-opacity-30 dark:bg-opacity-10 p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2"
          >
            <img
              alt="token-icon"
              src="./assets/tether.svg"
              className="w-[36px] h-[36px] rounded-full"
            />

            <div className="flex justify-between ml-2">
              <div>
                <h3 className="font-bold">Tether</h3>
                <p className="font-mono text-sm">{externalUSDT}</p>
              </div>
            </div>
          </li>
        </>

        <li className="grid grid-cols-[auto_1fr] bg-white items-center rounded-md bg-opacity-30 dark:bg-opacity-10 dark:bg-[#1B1B1B] p-2 hover:bg-opacity-80 dark:hover:bg-opacity-30 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
            <g fill="none" fillRule="evenodd">
              <circle cx="16" cy="16" r="16" fill="#627EEA" />
              <g fill="#FFF" fillRule="nonzero">
                <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
                <path d="M16.498 4L9 16.22l7.498-3.35z" />
                <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
                <path d="M16.498 27.995v-6.028L9 17.616z" />
                <path
                  fillOpacity=".2"
                  d="M16.498 20.573l7.497-4.353-7.497-3.348z"
                />
                <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
              </g>
            </g>
          </svg>

          <div className="flex justify-between ml-2 text-left">
            <div>
              <h3 className="font-bold ">Ethereum</h3>
              <p className="font-mono text-sm">{externalEthereum}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default EthereumTokens;
