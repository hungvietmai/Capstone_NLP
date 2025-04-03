'use client';

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/app/search-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  // Instead of using URL parameters, manage the search query in state.
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch search results whenever the query changes.
  useEffect(() => {
    if (!query.trim()) {
      setResult(null);
      setError(null);
      return;
    }

    const fetchResult = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setResult(data.result ?? null);
      } catch (err) {
        setError("Đã xảy ra lỗi trong quá trình tìm kiếm.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-10 tracking-tight">
          Tra Cứu Bệnh Lý
        </h1>
        <SearchBar initialQuery={query} onSearch={setQuery} />
      </div>
      <div className="max-w-3xl mx-auto mt-10">
        {isLoading && (
          <div className="flex items-center justify-center py-10 text-blue-600">
            <Loader2 className="animate-spin w-6 h-6 mr-2" />
            Đang tải kết quả...
          </div>
        )}
        {!isLoading && error && (
          <div className="text-red-500 mt-6 text-center">{error}</div>
        )}
        {!isLoading && !error && !query && (
          <div className="text-gray-500 mt-6 text-center">
            Vui lòng nhập từ khoá để tra cứu thông tin bệnh lý.
          </div>
        )}
        {!isLoading && query && !result && (
          <div className="text-gray-500 mt-6 text-center">
            Không tìm thấy kết quả cho "<span className="font-semibold">{query}</span>"
          </div>
        )}
        {!isLoading && result && (
          <Card className="border border-gray-200 shadow-md rounded-lg py-2 transition transform hover:scale-105">
            <CardContent className="p-6">
              <Link href={`/disease/${result.title}`} passHref>
                <h1 className="text-xl font-bold text-blue-700 hover:underline cursor-pointer mb-2">
                  {result.title}
                </h1>
              </Link>
              <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                {result.content}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
