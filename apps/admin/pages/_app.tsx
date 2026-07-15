import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { Session } from 'next-auth'
import { Provider } from 'react-redux'
import store from '../store'

function MyApp({ Component, pageProps, session }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </SessionProvider>
  )
}

export default MyApp