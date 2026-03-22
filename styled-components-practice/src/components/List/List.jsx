import React from 'react';


cons

export const List = ({items}) => {
  return (
    <ul>
      {
        items.map(item =>
          <li key={item.id}>{item.title}</li>
      )}
    </ul>
  )
}
