interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode
}

export const List = <T,>({ items, renderItem }: ListProps<T>) => {
  return (
    <ul>
      {items.map((item, i) => <li key={i}>{renderItem(item)}</li>)}
    </ul>
  )
}
