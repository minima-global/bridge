
interface IProps {
  _currentNavigation: 'orders'|'balance'|'keys';
  setCurrentNavigation: (nav: 'orders'|'balance'|'keys') => void;
}
const DetailsNavigation = ({_currentNavigation, setCurrentNavigation}: IProps) => {
  

  const isActive = (_current: string) => {
    return _currentNavigation === _current
      ? "bg-violet-500 rounded-lg text-white dark:text-black font-bold hover:text-white dark:hover:text-black py-2 text-xs"
      : "text-violet-300 hover:text-violet-400 cursor-pointer my-auto opacity-50 duration-100 text-xs";
  };

  return (
    <div className="mx-4 sm:mx-0 mb-4">
      <nav className="bg-violet-800 rounded-lg grid grid-cols-3 max-w-sm mx-auto text-center">
        <a
          onClick={() => setCurrentNavigation("balance")}
          className={`${isActive("balance")}`}
        >
          Balance
        </a>
        <a
          onClick={() => {            
            setCurrentNavigation("orders");
          }}
          className={`${isActive("orders")}`}
        >
          Liquidity
        </a>
        <a
          onClick={() => setCurrentNavigation("keys")}
          className={`${isActive("keys")}`}
        >
          Keys
        </a>
      </nav>
    </div>
  );
};

export default DetailsNavigation;
