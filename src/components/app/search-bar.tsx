"use client";

import React, { useState, useRef, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string, model: string) => void;
}

export function SearchBar({ initialQuery = "", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState<string>(initialQuery);
  const [model, setModel] = useState<string>("bm25");
  const [open, setOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLFormElement>(null);

  const models = [
    { label: "BM25", value: "bm25" },
    { label: "Word2Vec", value: "word2vec" },
    { label: "HuggingFace", value: "huggingface" },
  ];
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!query.trim()) return;
    if (onSearch) onSearch(query, model);
  };

  return (
    <form
      ref={wrapperRef}
      onSubmit={handleSubmit}
      className="w-full max-w-3xl mx-auto relative p-4"
    >
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden p-2 h-14">
        {/* Model chooser */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              type="button"
              className="flex items-center px-3"
            >
              {models.find((m) => m.value === model)?.label || "Model"}
              <ChevronsUpDown className="ml-1 h-4 w-4 opacity-70" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-0">
            <Command>
              <CommandGroup>
                {models.map((m) => (
                  <CommandItem
                    key={m.value}
                    value={m.value}
                    onSelect={(currentValue: string) => {
                      setModel(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        model === m.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {m.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Text input for search query */}
        <Input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="Search for diseases..."
          className="flex-1 p-3 border-0 focus-visible:ring-0"
        />

        {/* Search button */}
        <Button variant="ghost" type="submit" className="px-3">
          <Search strokeWidth={3} />
        </Button>
      </div>
    </form>
  );
}
