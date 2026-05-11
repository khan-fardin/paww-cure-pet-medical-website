"use client";

import { useEffect, useState } from "react";

interface Pet {
  _id: string;
  name: string;
  species: "dog" | "cat" | "rabbit" | "bird" | "other";
  breed: string;
  weight: number;
  dateOfBirth: string;
  avatar?: string;
  medicalConditions: string[];
  allergies: string[];
  medications: string[];
  vaccinationStatus: "up-to-date" | "pending" | "overdue";
  lastVaccineDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsePetsReturn {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePets(): UsePetsReturn {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/pets", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to view pets");
        } else {
          setError("Failed to load pets");
        }
        return;
      }

      const data = await response.json();
      setPets(data.data || []);
    } catch (err) {
      setError("Error fetching pets");
      console.error("usePets error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPets();
  }, []);

  return {
    pets,
    loading,
    error,
    refetch: fetchPets,
  };
}
