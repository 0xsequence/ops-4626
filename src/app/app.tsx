import { Toaster } from 'sonner'

import { HomePage } from '../pages/home'

export function App() {
  return (
    <>
      <HomePage />
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.94)',
            color: '#e2e8f0',
            border: '1px solid rgba(148, 163, 184, 0.18)',
          },
        }}
      />
    </>
  )
}
