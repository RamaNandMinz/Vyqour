import Head from 'next/head';
import Hero from '../components/home/Hero';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Vyqour | Home</title>
      </Head>
      <Hero />
    </div>
  );
}