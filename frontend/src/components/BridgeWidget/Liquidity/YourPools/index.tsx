import WrappedPool from "./WrappedPool/index.js";
import TetherPool from "./TetherPool/index.js";

const YourPools = () => {  

  return (
    <div className="flex flex-col gap-3">
      <WrappedPool />
      <TetherPool />
    </div>
  );
};

export default YourPools;
