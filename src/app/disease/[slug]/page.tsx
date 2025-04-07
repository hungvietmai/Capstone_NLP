"use client";

import React, { useEffect, useState } from "react";
import { notFound } from "next/navigation";

interface DiseaseDetail {
  title: string;
  content: string;
}

interface DiseaseDetailPageProps {
  params: { slug: string };
}

export default function DiseaseDetailPage({ params }: DiseaseDetailPageProps) {
  const [detail, setDetail] = useState<DiseaseDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDiseaseDetail = async () => {
      try {
        // Fetch disease detail from the /disease endpoint using the disease id (params.slug)
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_SERVICE_ENDPOINT}/disease?id=${params.slug}`
        );
        if (!res.ok) {
          notFound();
        }
        const data: DiseaseDetail = await res.json();
        if (!data.title || !data.content) {
          notFound();
        }
        setDetail(data);
      } catch (error) {
        console.error("Error fetching disease detail:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiseaseDetail();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading disease details...</p>
      </div>
    );
  }

  if (!detail) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4">
      <div className="max-w-4xl mx-auto border border-gray-300 shadow-md p-8 bg-white">
        {/* Newspaper-style header */}
        <header className="mb-6 text-center">
          <h1 className="text-5xl font-bold font-serif uppercase tracking-wider text-gray-800 mb-2">
            The Disease Times
          </h1>
          <p className="text-sm text-gray-600 italic">
            A Public Health Journal
          </p>
          <hr className="my-4 border-gray-300" />
        </header>

        {/* Article title */}
        <h2 className="text-3xl font-bold font-serif text-center mb-4 text-gray-800">
          {detail.title}
        </h2>

        {/* Newspaper-style content rendered in 2 columns */}
        <article
          className="prose lg:prose-lg font-serif text-justify columns-2 gap-8 leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{ __html: detail.content }}
        />
      </div>
    </div>
  );
}
