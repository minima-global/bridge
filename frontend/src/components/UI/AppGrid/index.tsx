const AppGrid = ({ children }) => {
  return <div className="grid grid-rows-[48px_1fr_48px] md:grid-rows-[36px_1fr] h-screen">{children}</div>;
};

export default AppGrid;
