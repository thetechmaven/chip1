import React from 'react';

interface ITable {
  children: React.ReactNode;
  className?: string;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-b">{children}</tr>;
}

export function Td({ children }: { children: React.ReactNode }) {
  return <td className="p-4">{children}</td>;
}

export function Th({ children }: { children: React.ReactNode }) {
  return <th className="p-4 font-medium text-left">{children}</th>;
}

function Table({ children, className }: ITable) {
  return (
    <div className="w-full min-h-0 border rounded-2xl overflow-hidden">
      <table className={'w-full ' + className}>{children}</table>
    </div>
  );
}

export default Table;
