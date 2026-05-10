"use client";

import { useEffect, useState } from "react";

interface Vet {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  licenseNumber: string;
  specializations: string[];
  experience: number;
  bio?: string;
  clinicName: string;
  clinicCity: string;
  clinicProvince: string;
  phoneNumber: string;
  consultationFee: number;
  isVerified: boolean;
  isActive: boolean;
  averageRating: number;
  totalReviews: number;
  acceptingNewPatients: boolean;
}

interface UseVetsParams {
  city?: string;
  specialization?: string;
  minRating?: number;
  page?: number;
  limit?: number;
  skip?: boolean; // true to prevent auto-fetch
}

interface UseVetsReturn {
  vets: Vet[];
  loading: boolean;
  error: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  refetch: () => void;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function useVets(params?: UseVetsParams): UseVetsReturn {
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(!params?.skip);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination | undefined>();

  const fetchVets = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.city) searchParams.append("city", params.city);
      if (params?.specialization)
        searchParams.append("specialization", params.specialization);
      if (params?.minRating)
        searchParams.append("minRating", params.minRating.toString());
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());

      const url = `/api/vets?${searchParams.toString()}`;
      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        setError("Failed to load vets");
        return;
      }

      const data = await response.json();
      setVets(data.data || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      setError("Error fetching vets");
      console.error("useVets error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.skip) {
      return;
    }

    const timeoutId = setTimeout(() => {
      void fetchVets();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [params?.city, params?.specialization, params?.minRating, params?.page, params?.skip]);

  return {
    vets,
    loading,
    error,
    pagination,
    refetch: fetchVets,
  };
}
