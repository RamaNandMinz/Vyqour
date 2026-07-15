import Head from 'next/head';
import Hero from '../components/home/Hero';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Head>
        <title>Vyqour</title>
      </Head>
      <Hero />
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;