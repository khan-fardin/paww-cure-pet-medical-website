"use client";

import { useEffect, useState } from "react";

interface Consultation {
  _id: string;
  type: "video" | "audio" | "chat" | "in-clinic";
  status: "scheduled" | "ongoing" | "completed" | "cancelled" | "no-show";
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  fees: {
    consultationFee: number;
    discount?: number;
    tax?: number;
    total: number;
  };
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  petId?: {
    _id: string;
    name: string;
    species: string;
    breed: string;
  };
  vetId?: {
    _id: string;
    name: string;
    email: string;
  };
  ownerId?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseConsultationsReturn {
  consultations: Consultation[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useConsultations(): UseConsultationsReturn {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/consultations", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to view consultations");
        } else {
          setError("Failed to load consultations");
        }
        return;
      }

      const data = await response.json();
      setConsultations(data.data || []);
    } catch (err) {
      setError("Error fetching consultations");
      console.error("useConsultations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  return {
    consultations,
    loading,
    error,
    refetch: fetchConsultations,
  };
}
