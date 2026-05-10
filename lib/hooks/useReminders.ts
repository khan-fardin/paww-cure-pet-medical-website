"use client";

import { useEffect, useState } from "react";

interface Reminder {
  _id: string;
  type: "medicine" | "vaccination" | "checkup" | "follow-up" | "other";
  title: string;
  description?: string;
  dueDate: string;
  frequency: "once" | "daily" | "weekly" | "monthly" | "yearly";
  isCompleted: boolean;
  completedAt?: string;
  notificationSent: boolean;
  priority: "low" | "normal" | "high";
  petId?: {
    _id: string;
    name: string;
    species: string;
    breed: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface UseRemindersReturn {
  reminders: Reminder[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReminders(): UseRemindersReturn {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/reminders", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to view reminders");
        } else {
          setError("Failed to load reminders");
        }
        return;
      }

      const data = await response.json();
      setReminders(data.data || []);
    } catch (err) {
      setError("Error fetching reminders");
      console.error("useReminders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  return {
    reminders,
    loading,
    error,
    refetch: fetchReminders,
  };
}
