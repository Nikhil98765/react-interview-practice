import React, { lazy, Suspense } from 'react'

const HomeComponent = lazy(() => import('./Home').then(module => ({ default: module.Home })));
const DashboardComponent = lazy(() => import('./Dashboard'));

export const LazyLoadingExample = () => {
  return (
    <div>
      <Suspense fallback={<p>Loading Home Component ...</p>}>
        <HomeComponent />
      </Suspense>
      <Suspense fallback={ <p>Loading Dashboard component...</p>}>
        <DashboardComponent />
      </Suspense>
    </div>
  )
}
