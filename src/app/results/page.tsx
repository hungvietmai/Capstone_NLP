'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/app/search-bar';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function ResultsPage() {
  // Read the query from URL parameters and pass it as the initial value
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  console.log("ResultsPage")

  const [result, setResult] = useState<Result | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When the initialQuery changes, fetch the search result
  useEffect(() => {
    if (!initialQuery.trim()) {
      setResult(null);
      setError(null);
      return;
    }

    const fetchResult = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: initialQuery }),
        });
        const data = await res.json();
        setResult(data.result ?? null);
      } catch (err) {
        setError('Đã xảy ra lỗi trong quá trình tìm kiếm.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [initialQuery]);

  return (
    <div className="min-h-screen bg-gray-50 px-10 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Render the SearchBar with the current query as its initial value */}
        <SearchBar initialQuery={initialQuery} />
        <div className="mt-10">
          {isLoading && (
            <div className="flex items-center justify-center py-10 text-blue-600">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              Đang tải kết quả...
            </div>
          )}
          {!isLoading && error && (
            <div className="text-red-500 mt-6">{error}</div>
          )}
          {!isLoading && !error && !initialQuery && (
            <div className="text-gray-500 mt-6">
              Vui lòng nhập từ khoá để tra cứu thông tin bệnh lý.
            </div>
          )}
          {!isLoading && initialQuery && !result && (
            <div className="text-gray-500 mt-6">
              Không tìm thấy kết quả cho "<span className="font-semibold">{initialQuery}</span>"
            </div>
          )}
          {!isLoading && result && (
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="pt-6 pb-8 px-6 space-y-4">
                <h1 className="text-2xl font-bold text-blue-800">{result.title}</h1>
                <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                  {result.content}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
