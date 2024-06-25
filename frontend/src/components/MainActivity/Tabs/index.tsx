import  { useContext } from 'react';
import { appContext } from '../../../AppContext';

const Tabs = () => {
   const { _switchLogView, setSwitchLogView } = useContext(appContext);

  return (
    <div className="ml-4">
      <div className="grid grid-cols-2 gap-4">
        <h3
          className={`font-bold cursor-pointer ${_switchLogView === 'all' ? 'text-blue-500' : ''}`}
          onClick={() => setSwitchLogView('all')}
        >
          All logs
        </h3>
        <h3
          className={`font-bold cursor-pointer ${_switchLogView === 'orders' ? 'text-blue-500' : ''}`}
          onClick={() => setSwitchLogView('orders')}
        >
          Orders
        </h3>
      </div>      
    </div>
  );
};

export default Tabs;