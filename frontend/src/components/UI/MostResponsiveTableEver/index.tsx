import { ReactNode } from "react";

interface Props {
  headers: string[];
  data: any[];
  headerClasses?: string;
  headerClassesMobile?: string;
  headerCellClasses?: string[];
  headerCellClassesMobile?: string[];
  renderCell: (cellData: any) => ReactNode;
}
const MostResponsiveTableEver = ({
  headers,
  headerClasses,
  headerClassesMobile,
  headerCellClasses,
  headerCellClassesMobile,
  data,
  renderCell,
}: Props) => {
  console.log(renderCell);
  console.log(data);
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
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>{renderCell(row)}</tr>
          ))}
        </tbody>
      </table>

      <div className="block md:hidden w-full">
        {data.map((cell, cellIndex) => (
          <div className={`${headerClassesMobile} grid grid-cols-[auto_1fr]`} key={cellIndex}>
            <div className="divide-x divide-teal-300">
              {headers.map((header, headerIndex) => (
                <div key={headerIndex} className={headerCellClassesMobile ? headerCellClassesMobile[headerIndex] : ""}>{header}</div>
              ))}
            </div>
            <div></div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MostResponsiveTableEver;
