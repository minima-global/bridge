interface IProps {
  _currentNavigation: string;
  setCurrentNavigation: (nav: string) => void;
  navigation: string[];
}
const DetailsNavigation = ({
  _currentNavigation,
  setCurrentNavigation,
  navigation,
}: IProps) => {
  const isActive = (_current: string) => {
    return _currentNavigation === _current
      ? "bg-gray-100 text-black dark:bg-black rounded-lg dark:text-gray-100 font-bold py-2 text-xs"
      : "text-gray-800 dark:text-gray-100 cursor-pointer my-auto opacity-50 duration-100 text-xs";
  };

  return (
    <div>
      <nav className={`shadow-sm dark:shadow-none dark:bg-black dark:bg-opacity-20 rounded-lg grid grid-cols-${navigation.length} max-w-sm mx-auto text-center`}>
        {navigation.map((n, index) => (
          <div
            key={index}
            onClick={() => setCurrentNavigation(n)}
            className={`${isActive(n)}`}
          >
            {n}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default DetailsNavigation;
