import { useContext, useEffect, useState } from "react";
import { getLogs } from "../../../../dapp/js/sql.js";
import { appContext } from "../../AppContext.js";
import { copyToClipboard } from "../../utils/index.js";
import {ClipboardCopy} from "lucide-react";
interface ApplicationLog {
  id: string;
  action: string;
  message: string;
  timestamp: string;
}

const AppLogs = () => {
  const { loaded } = useContext(appContext);

  const [logs, setLogs] = useState<ApplicationLog[]>([]);
  const [currPage, setCurrPage] = useState(1);

  useEffect(() => {
    if (loaded && loaded.current) {
      getLogs(currPage, function (resp) {
        const respLogs = resp.rows;
        setLogs(
          respLogs.map((l) => ({
            id: l.ID,
            action: l.TYPE,
            message: l.MESSAGE,
            timestamp: l.TIMESTAMP,
          }))
        );
      });
    }
  }, [loaded, currPage]);

  const copy = (log: ApplicationLog) => {
    const logText = `ID: ${log.id}\nTimestamp: ${log.timestamp}\nAction: ${log.action}\nMessage: ${log.message}`;
    copyToClipboard(logText);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0">
      <div className="py-5 flex items-center justify-between gap-4">
        <h3 className="text-lg leading-6 font-medium text-black dark:text-white">
          Application System Logs
        </h3>
        <button onClick={() => {
          getLogs(currPage, function (resp) {
            const respLogs = resp.rows;
            setLogs(
              respLogs.map((l) => ({
                id: l.ID,
                action: l.TYPE,
                message: l.MESSAGE,
                timestamp: l.TIMESTAMP,
              }))
            );
          });
        }} type="button" className="p-0 bg-black text-white font-bold text-sm px-4">Refresh logs</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-sky-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Timestamp
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Action
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Message
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs &&
              logs.length &&
              logs.map((log) => (                
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => copy(log)}     
                        type="button"                 
                        className="px-4 py-1 text-white bg-sky-200"                        
                      >
                        <ClipboardCopy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                      </button>
                    </td>
                  </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-2 my-10">
        <button className="bg-black text-white disabled:opacity-10" type="button" disabled={currPage === 1} onClick={() => setCurrPage(prevState => prevState - 1)}>Previous</button>
        <button className="bg-blue-500 text-white" type="button" onClick={() => setCurrPage(prevState => prevState + 1)}>Next</button>
      </div>
    </div>
  );
};

export default AppLogs;
