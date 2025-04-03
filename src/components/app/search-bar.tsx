'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Clock, Trash2, SquareArrowOutUpRight } from 'lucide-react';
import { Card } from '../ui/card';

type SearchBarProps = {
  initialQuery?: string;
};

export function SearchBar({ initialQuery = '' }: SearchBarProps) {
  console.log("SearchBar");
  const [query, setQuery] = useState(initialQuery);
  const [history, setHistory] = useState<HistoryResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Fetch suggestions & history from API
  const fetchSuggestions = async (q: string) => {
    try {
      const res = await fetch(`/api/search-suggestion?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setHistory(data.history);
      setSuggestions(data.suggestions.map((s: any) => s.text));
      setDropdownOpen(true);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  // Debounce fetching suggestions when query changes
  useEffect(() => {
    if (query.trim() === '') {
      setHistory([]);
      setSuggestions([]);
      setDropdownOpen(false);
      return;
    }
    const debounce = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(debounce);
  }, [query]);

  // Handle search form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === '') return;
    setDropdownOpen(false);
    router.push(`/results?q=${encodeURIComponent(query)}`);
  };

  // Delete a history item by id
  const handleDeleteHistory = async (
    e: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    e.stopPropagation();
    try {
      await fetch('/api/search-history', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  return (
    <form ref={wrapperRef} onSubmit={handleSubmit} className="w-full max-w-xl relative">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClick={() => fetchSuggestions(query)}
        placeholder="Tìm kiếm bệnh lý..."
        className="h-14 text-lg pl-5 pr-20 rounded-full shadow border focus-visible:ring-0"
      />
      <Button
        variant="ghost"
        type="submit"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-5 rounded-full"
      >
        <Search strokeWidth={3} />
      </Button>

      {dropdownOpen && (suggestions.length > 0 || history.length > 0) && (
        <Card className="absolute z-10 w-full mt-2 rounded-md shadow-lg bg-white border overflow-y-auto max-h-80 p-0">
          <ul className="divide-y divide-gray-200">
            {suggestions.map((sug, idx) => (
              <li
                key={`sug-${idx}`}
                onClick={() => {
                  setQuery(sug);
                  setDropdownOpen(false);
                  router.push(`/results?q=${encodeURIComponent(sug)}`);
                }}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-gray-800"
              >
                <SquareArrowOutUpRight size={16} className="text-gray-400" />
                {sug}
              </li>
            ))}
            {history.length > 0 && (
              <li className="px-4 py-2 text-xs text-gray-400 bg-gray-50 font-semibold uppercase">
                Lịch sử tìm kiếm
              </li>
            )}
            {history.map((h) => (
              <li
                key={`his-${h.id}`}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between gap-2 text-gray-800"
              >
                <div
                  onClick={() => {
                    setQuery(h.query);
                    setDropdownOpen(false);
                    router.push(`/results?q=${encodeURIComponent(h.query)}`);
                  }}
                  className="flex items-center gap-2 flex-1"
                >
                  <Clock size={16} className="text-gray-400" />
                  {h.query}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  title="Xoá khỏi lịch sử"
                  onClick={(e) => handleDeleteHistory(e, h.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </form>
  );
}
