import React from "react";

interface ContentGridProps {
  children: React.ReactNode[] | React.ReactNode;
}

const ContentGrid = ({ children }: ContentGridProps) => {
  return (
    <div className="grid grid-cols-[1fr_minmax(0,_560px)_1fr]">
      <div />
      <div>{children}</div>
      <div />
    </div>
  );
};

export default ContentGrid;
