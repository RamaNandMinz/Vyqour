import Hero from "@/components/home/Hero";
import CategoryNav from "@/components/home/CategoryNav";
import NewArrivals from "@/components/home/NewArrivals";
import Collections from "@/components/home/Collections";
import AccessoriesSection from "@/components/home/AccessoriesSection";
import BestSellers from "@/components/home/BestSellers";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoryNav />
      <NewArrivals />
      <Collections />
      <AccessoriesSection />
      <BestSellers />
    </main>
  );
}
