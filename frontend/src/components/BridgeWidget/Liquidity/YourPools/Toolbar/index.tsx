interface IProps {
  token: string;
}
const Toolbar = ({ token }: IProps) => {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center py-2 bg-gray-100 bg-opacity-30 dark:bg-black dark:bg-opacity-20">
      <div />
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <h3 className="text-sm font-bold text-center">Native</h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 10h14l-4 -4" />
          <path d="M17 14h-14l4 4" />
        </svg>
        <h3 className="text-sm font-bold text-center">{token}</h3>
      </div>
      <div />
    </div>
  );
};

export default Toolbar;
