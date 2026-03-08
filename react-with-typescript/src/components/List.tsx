import type { PropsWithChildren } from "react";

interface ListProps<T> extends PropsWithChildren {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

// React.FC is not recommended for generic components
export const List = <T,>({ items, renderItem }: ListProps<T>) => {
  return (
    <ul>
      {items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}
    </ul>
  )
}
