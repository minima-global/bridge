import { ReactNode, useState } from "react";

interface Props {
  headers: string[];
  data: any[];
  headerClasses?: string;
  headerClassesMobile?: string;
  headerCellClasses?: string[];
  headerCellClassesMobile?: string[];
  renderCell: (cellData: any, index: number, handleFocus: (i: number, t: string) => void, focusStates: any, txHashFocusStates: any) => ReactNode;
  renderCellMobile: (cellData: any, index: number, handleFocus: (i: number, t: string) => void, focusStates: any) => ReactNode;
}
const MostResponsiveTableEver = ({
  headers,
  headerClasses,
  headerClassesMobile,
  headerCellClasses,
  headerCellClassesMobile,
  data,
  renderCell,
  renderCellMobile,
}: Props) => {

  const [focusStates, setFocusStates] = useState({});
  const [txHashFocusStates, setTxHashFocusStates] = useState({});
  const handleFocus = (index, type) => {
    if (type === 'hash') {
      setFocusStates((prev) => ({ ...prev, [index]: true }));
    } else if (type === 'txnhash') {
      setTxHashFocusStates((prev) => ({ ...prev, [index]: true }));
    }
  };

  return (
    <>
      <table className="w-full hidden md:block">
        <thead className={`${headerClasses}`}>
          <tr>
            {headers.map((header, headerIndex) => (
              <th
                className={
                  headerCellClasses ? headerCellClasses[headerIndex] : ""
                }
                key={headerIndex}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data ? data.map((row, rowIndex) => (
            <tr key={rowIndex}>{renderCell(row, rowIndex, handleFocus, focusStates, txHashFocusStates)}</tr>
          )): null}
        </tbody>
      </table>

      <div className="block md:hidden w-full">
        {data ? data.map((cell, cellIndex) => (
          <div className={`${headerClassesMobile} grid grid-cols-[auto_1fr]`} key={cellIndex}>
            <div className="divide-x dark:divide-teal-300">
              {headers.map((header, headerIndex) => (
                <div key={headerIndex} className={headerCellClassesMobile ? headerCellClassesMobile[headerIndex] : ""}>{header}</div>
              ))}
            </div>
            <div className="bg-gray-200 dark:bg-black !bg-opacity-10 overflow-hidden">{renderCellMobile(cell, cellIndex, handleFocus, focusStates)}</div>
          </div>
        )): null}
      </div>
    </>
  );
};

export default MostResponsiveTableEver;
