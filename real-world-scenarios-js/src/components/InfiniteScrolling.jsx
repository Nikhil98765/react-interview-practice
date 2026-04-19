import React from 'react'
import { useInfiniteScroll } from '../hooks/useInifiniteScroll'

export const fetchPosts = (currentPage) => {
  return fetch(`https://jsonplaceholder.typicode.com/posts?_page=${currentPage}&_limit=10`)
    .then(r => r.json());
}

export const InfiniteScrolling = () => {

  const { items, lastItemRef, hasMore, loading} = useInfiniteScroll(fetchPosts);

  return (
    <>
      <div>
        {
          items.map((item, index) => {
            const isLast = items.length - 1 === index;
            return (
              <div ref={isLast ? lastItemRef : null}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            );
          })
        }
      </div>
      {loading && <p>Loading...</p>}
      {!hasMore && <p>You have reached the end!</p>}
    </>
  )
}
