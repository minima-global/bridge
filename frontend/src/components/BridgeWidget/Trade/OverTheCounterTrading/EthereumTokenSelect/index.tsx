
interface Props {
  setToken: (id: string) => void;
  token: string;
}
const EthereumTokenSelect = ({  token }: Props) => {

  return (
    <div
      className="relative bg-white dark:bg-black dark:bg-opacity-10 p-2 pl-5 grid grid-cols-[1fr_auto] items-center hover:bg-opacity-50"
    >
      <div className="flex flex-col pr-2 justify-center items-center">
        <img
          alt="token-icon"
          src={
            token === "WMINIMA" ? "./assets/wtoken.svg" : "./assets/tether.svg"
          }
          className="w-[30px] h-[30px] rounded-full"
        />
        <p className="text-xs font-bold pt-1">{token}</p>
      </div>      
    </div>
  );
};

export default EthereumTokenSelect;
