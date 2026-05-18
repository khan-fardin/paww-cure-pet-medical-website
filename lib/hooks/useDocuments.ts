"use client";

import { useEffect, useState } from "react";

interface Document {
  _id: string;
  userId: string;
  petId: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/documents");
        
        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }
        
        const data = await response.json();
        
        if (data.success) {
          setDocuments(data.data || []);
        } else {
          setError(data.message || "Failed to fetch documents");
        }
      } catch (err) {
        console.error("useDocuments error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
  };
}
