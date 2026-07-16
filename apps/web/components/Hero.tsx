import Head from 'next/head';
import Image from 'next/image';

const Hero = () => {
  return (
    <div>
      <Head>
        <title>Hero</title>
      </Head>
      <Image src="/hero.jpg" width={500} height={500} />
    </div>
  );
};

export default Hero;