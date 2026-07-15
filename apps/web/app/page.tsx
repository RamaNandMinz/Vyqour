import Head from 'next/head';
import Hero from '../components/home/Hero';
import CategoryNav from '../components/home/CategoryNav';
import NewArrivals from '../components/home/NewArrivals';
import Collections from '../components/home/Collections';
import AccessoriesSection from '../components/home/AccessoriesSection';
import BestSellers from '../components/home/BestSellers';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Home</title>
      </Head>
      <Hero />
      <CategoryNav />
      <NewArrivals />
      <Collections />
      <AccessoriesSection />
      <BestSellers />
    </div>
  );
}