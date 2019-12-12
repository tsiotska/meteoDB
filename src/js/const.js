import React from 'react';

export const baseUrl = process.env.REACT_APP_LAMETSY_API_HOST;
export const emptyContainer = <div className="text-center empt">
  <p>This tab is empty now</p>
</div>;
export const classNameNullConverter = (e) => !(e === undefined || e === null) ? e : "";
export function classJoin() {
  return [...arguments].filter(x => classNameNullConverter(x) !== "").join(' ');
}
export default (props) => { };
