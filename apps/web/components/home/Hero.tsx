import Head from 'next/head';
import Link from 'next/link';

export default function Hero() {
  return (
    <section
      className="bg-black h-screen md:h-screen md:flex md:items-center md:justify-center"
    >
      <Head>
        <title>Vyqour | Streetwear that speaks</title>
      </Head>
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <h1
          className="text-5xl font-bold text-center text-deep-purple-accent md:text-6xl"
        >
          VYQOUR
        </h1>
        <p className="text-lg text-center text-white md:text-2xl">
          Streetwear that speaks
        </p>
        <div className="mt-6 md:mt-12">
          <Link href="/products">
            <a
              className="bg-electric-blue-accent hover:bg-deep-purple-accent text-white font-bold py-2 px-4 rounded-md"
            >
              Shop Now
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}