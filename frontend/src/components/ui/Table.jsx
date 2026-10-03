import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto border border-border-light bg-surface ${className}`}>
    <table className="w-full text-sm text-left whitespace-nowrap">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`text-[10px] font-bold text-content-muted uppercase tracking-wider border-b border-border-light bg-base ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-border-light ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '' }) => (
  <tr className={`hover:bg-base/50 transition-colors ${className}`}>
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th scope="col" className={`px-6 py-4 font-semibold ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 ${className}`}>
    {children}
  </td>
);
