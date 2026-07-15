import React from 'react';
import CategoryNav from './CategoryNav';
import Collections from './Collections';
import AccessoriesSection from './AccessoriesSection';

export default function Hero() {
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800">
      <h1 className="text-3xl font-bold">Hero Section</h1>
      <CategoryNav title="Hero Section" />
      <Collections />
      <AccessoriesSection />
      <p>Coming soon...</p>
    </div>
  );
}