"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Star } from "lucide-react";

type Ratings = {
  communication: number;
  professionalism: number;
  punctuality: number;
  rating: number;
};

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

export function ReviewForm({
  consultationId,
  disabled = false,
  reviewed = false,
}: {
  consultationId: string;
  disabled?: boolean;
  reviewed?: boolean;
}) {
  const [ratings, setRatings] = useState<Ratings>({
    communication: 5,
    professionalism: 5,
    punctuality: 5,
    rating: 5,
  });
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    reviewed ? "saved" : "idle"
  );

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    try {
      const response = await fetch("/api/reviews", {
        body: JSON.stringify({
          ...ratings,
          comment,
          consultationId,
          title,
        }),
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Could not submit review");
      }

      setState("saved");
      setMessage("Thank you. Your verified feedback is now published.");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error ? error.message : "Could not submit review"
      );
    }
  }

  if (disabled) {
    return (
      <div className="rounded-[2rem] bg-slate-50 p-6 text-sm text-slate-500">
        Reviews open after the consultation is completed.
      </div>
    );
  }

  if (state === "saved") {
    return (
      <div className="flex items-start gap-3 rounded-[2rem] bg-emerald-50 p-6 text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-bold">
            {reviewed ? "You already reviewed this consultation" : "Review submitted"}
          </p>
          <p className="mt-1 text-sm">
            {message || "Your feedback helps other pet users choose with confidence."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="rounded-[2rem] bg-slate-50 p-6" onSubmit={submitReview}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        Verified consultation review
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">
        How was your experience?
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Be specific, respectful, and focus on the consultation.
      </p>

      <div className="mt-6 space-y-4">
        <RatingInput
          label="Overall experience"
          onChange={(value) =>
            setRatings((current) => ({ ...current, rating: value }))
          }
          value={ratings.rating}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <RatingInput
            compact
            label="Communication"
            onChange={(value) =>
              setRatings((current) => ({ ...current, communication: value }))
            }
            value={ratings.communication}
          />
          <RatingInput
            compact
            label="Professionalism"
            onChange={(value) =>
              setRatings((current) => ({ ...current, professionalism: value }))
            }
            value={ratings.professionalism}
          />
          <RatingInput
            compact
            label="Punctuality"
            onChange={(value) =>
              setRatings((current) => ({ ...current, punctuality: value }))
            }
            value={ratings.punctuality}
          />
        </div>
      </div>

      <input
        className="mt-5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-emerald-600"
        disabled={state === "saving"}
        maxLength={100}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Give your review a short title"
        required
        value={title}
      />
      <textarea
        className="mt-3 min-h-32 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-emerald-600"
        disabled={state === "saving"}
        maxLength={1000}
        minLength={10}
        onChange={(event) => setComment(event.target.value)}
        placeholder="What did the vet do well? What could have been better?"
        required
        value={comment}
      />

      <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
        <span>Visible publicly after submission</span>
        <span>{comment.length}/1000</span>
      </div>

      {message ? (
        <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </p>
      ) : null}

      <button
        className="mt-5 w-full rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:bg-slate-300 sm:w-auto"
        disabled={state === "saving"}
        type="submit"
      >
        {state === "saving" ? "Publishing review..." : "Publish Review"}
      </button>
    </form>
  );
}

function RatingInput({
  compact = false,
  label,
  onChange,
  value,
}: {
  compact?: boolean;
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        {!compact ? (
          <span className="text-xs font-bold text-amber-600">
            {ratingLabels[value]}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            aria-label={`${label}: ${rating} stars`}
            className={`rounded-xl p-1.5 transition ${
              rating <= value
                ? "bg-amber-100 text-amber-500"
                : "bg-slate-50 text-slate-300"
            }`}
            key={rating}
            onClick={() => onChange(rating)}
            type="button"
          >
            <Star className="h-4 w-4 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );
}
