"use client";

import React, { useState, useEffect } from "react";
import { SearchBar } from "@/components/app/search-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch"; // shadcn Switch

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

interface PerformanceResult {
  model: string;
  number_of_results: number;
  query_time: number;
  results: DiseaseSearchItem[];
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [model, setModel] = useState("bm25");
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(
    null
  );
  const [performanceResults, setPerformanceResults] = useState<
    PerformanceResult[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComparison, setIsComparison] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResponse(null);
      setPerformanceResults([]);
      setError(null);
      return;
    }

    const fetchResult = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (isComparison) {
          // In comparison mode, fetch for all models concurrently.
          const models = ["bm25", "word2vec", "huggingface"];
          const responses = await Promise.all(
            models.map(async (m) => {
              const res = await fetch(
                `${
                  process.env.NEXT_PUBLIC_API_SERVICE_ENDPOINT
                }/search?query=${encodeURIComponent(query)}&model_type=${m}`
              );
              if (!res.ok) throw new Error(`Error fetching results for ${m}`);
              const data: SearchResponse = await res.json();
              return {
                model: m,
                number_of_results: data.number_of_results,
                query_time: data.query_time,
                results: data.results,
              } as PerformanceResult;
            })
          );
          setPerformanceResults(responses);
        } else {
          // Normal mode: fetch using the selected model.
          const res = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_SERVICE_ENDPOINT
            }/search?query=${encodeURIComponent(query)}&model_type=${model}`
          );
          if (!res.ok) throw new Error("Error fetching search results");
          const data: SearchResponse = await res.json();
          setSearchResponse(data);
        }
      } catch (err) {
        console.error(err);
        setError("Đã xảy ra lỗi trong quá trình tìm kiếm.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [query, model, isComparison]);

  const isQueryEmpty = !query.trim();

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-10 tracking-tight">
          Tra Cứu Bệnh Lý
        </h1>
        <SearchBar
          initialQuery={query}
          onSearch={(q, m) => {
            setQuery(q);
            setModel(m);
          }}
        />
        {/* Comparison toggle with disabled state if query is empty */}
        <div className="mt-4 flex items-center space-x-2">
          <span
            className={`text-gray-700 font-medium ${
              isQueryEmpty ? "opacity-50" : ""
            }`}
          >
            So sánh mô hình
          </span>
          <Switch
            checked={isComparison}
            onCheckedChange={setIsComparison}
            disabled={isQueryEmpty}
          />
        </div>
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

        {/* Normal mode (card view) */}
        {!isLoading && !error && !isComparison && searchResponse && (
          <>
            {searchResponse.results.length === 0 ? (
              <div className="text-gray-500 mt-6 text-center">
                Không tìm thấy kết quả cho "
                <span className="font-semibold">{query}</span>"
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  Sử dụng mô hình {model}, tìm thấy{" "}
                  {searchResponse.number_of_results} kết quả trong vòng{" "}
                  {searchResponse.query_time.toFixed(2)} ms.
                </p>
                <div className="space-y-4 mt-4">
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
              </>
            )}
          </>
        )}

        {/* Comparison mode (table view) */}
        {!isLoading && !error && isComparison && (
          <>
            {performanceResults.length === 0 ? (
              <div className="text-gray-500 mt-6 text-center">
                Không tìm thấy kết quả cho "
                <span className="font-semibold">{query}</span>"
              </div>
            ) : (
              <>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-3 px-4 border-b border-gray-200 text-left">
                          Mô hình
                        </th>
                        <th className="py-3 px-4 border-b border-gray-200 text-left">
                          Số kết quả
                        </th>
                        <th className="py-3 px-4 border-b border-gray-200 text-left">
                          Thời gian (ms)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceResults.map((item) => (
                        <tr key={item.model} className="hover:bg-gray-50">
                          <td className="py-3 px-4 border-b border-gray-200 capitalize">
                            {item.model}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200">
                            {item.number_of_results}
                          </td>
                          <td className="py-3 px-4 border-b border-gray-200">
                            {item.query_time.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Descriptive text for each model */}
                <div className="space-y-2">
                  {performanceResults.map((item) => (
                    <p
                      key={item.model}
                      className="text-sm text-gray-600 text-center"
                    >
                      Sử dụng mô hình {item.model}, tìm thấy{" "}
                      {item.number_of_results} kết quả trong vòng{" "}
                      {item.query_time.toFixed(2)} ms.
                    </p>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
