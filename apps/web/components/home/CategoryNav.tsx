import React from 'react';

interface Props {
  title: string;
}

const CategoryNav: React.FC<Props> = ({ title }) => {
  return (
    <div className="container mx-auto p-4 pt-6 md:p-6 lg:pb-20 lg:pt-24">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-4 text-gray-500 dark:text-gray-400">Coming soon</p>
    </div>
  );
};

export default CategoryNav;