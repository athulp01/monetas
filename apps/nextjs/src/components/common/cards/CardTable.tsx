import React from "react";

export const CardTable = (props: { children: React.ReactNode }) => {
  return (
    <div className="relative mt-6 overflow-x-auto shadow-md sm:rounded-lg">
      {props.children}
    </div>
  );
};
