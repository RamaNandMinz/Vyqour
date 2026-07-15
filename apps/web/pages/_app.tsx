import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { RecoilRoot } from 'recoil';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/Toastify.css';
import 'tailwindcss/base';
import 'tailwindcss/components';
import 'tailwindcss/utilities';
import 'styles/globals.css';

function MyApp({ Component, pageProps, session }: AppProps & { session: Session }) {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());

  return (
    <RecoilRoot>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>
          <Head>
            <title>My App</title>
          </Head>
          <Hydrate state={pageProps.dehydratedState}>
            <Component {...pageProps} />
          </Hydrate>
          <ToastContainer />
        </QueryClientProvider>
      </SessionProvider>
    </RecoilRoot>
  );
}

export default MyApp;