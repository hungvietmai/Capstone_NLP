'use client';

import { SearchBar } from '@/components/app/search-bar';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
      <h1 className="text-6xl font-bold mb-10">Tra Cứu Bệnh Lý</h1>
      <SearchBar />
    </div>
  );
}