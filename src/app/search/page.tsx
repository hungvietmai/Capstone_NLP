"use client";

import { useState, useEffect } from "react";
import { SearchBar } from "@/components/app/search-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface DiseaseSearchItem {
  id: string;
  title: string;
  description: string;
}

interface SearchResponse {
  results: DiseaseSearchItem[];
  number_of_results: number;
  query_time: number;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [model, setModel] = useState("bm25");
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Whenever the query or model changes, fetch new results.
  useEffect(() => {
    if (!query.trim()) {
      setSearchResponse(null);
      setError(null);
      return;
    }

    const fetchResult = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_SERVICE_ENDPOINT
          }/search?query=${encodeURIComponent(query)}&model_type=${model}`
        );
        if (!res.ok) {
          throw new Error("Error fetching search results");
        }
        const data: SearchResponse = await res.json();
        setSearchResponse(data);
      } catch {
        setError("Đã xảy ra lỗi trong quá trình tìm kiếm.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [query, model]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-10 tracking-tight">
          Tra Cứu Bệnh Lý
        </h1>
        {/* Pass a callback that updates both query and model */}
        <SearchBar
          initialQuery={query}
          onSearch={(q, m) => {
            setQuery(q);
            setModel(m);
          }}
        />
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
        {!isLoading &&
          query &&
          searchResponse &&
          searchResponse.results.length === 0 && (
            <div className="text-gray-500 mt-6 text-center">
              Không tìm thấy kết quả cho &quot;
              <span className="font-semibold">{query}</span>&quot;
            </div>
          )}
        {!isLoading && searchResponse && searchResponse.results.length > 0 && (
          <div className="space-y-4">
            {searchResponse.results.map((item) => (
              <Card
                key={item.id}
                className="border border-gray-200 shadow-md rounded-lg py-2 transition transform hover:scale-105"
              >
                <CardContent className="p-6">
                  <Link href={`/disease/${item.id}`} passHref>
                    <h1 className="text-xl font-bold text-blue-700 hover:underline cursor-pointer mb-2">
                      {item.title}
                    </h1>
                  </Link>
                  <p className="text-gray-800 text-base leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
