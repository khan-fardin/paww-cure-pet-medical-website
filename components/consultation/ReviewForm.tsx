"use client";

import { useState, type FormEvent } from "react";
import { Star } from "lucide-react";

export function ReviewForm({
  consultationId,
  disabled = false,
}: {
  consultationId: string;
  disabled?: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("saving");
    setMessage("");

    const response = await fetch("/api/reviews", {
      body: JSON.stringify({
        comment,
        communication: rating,
        consultationId,
        professionalism: rating,
        punctuality: rating,
        rating,
        title,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

    if (!response.ok) {
      setState("error");
      setMessage(payload?.message ?? "Could not submit review.");
      return;
    }

    setState("saved");
    setMessage("Thank you. Your feedback has been submitted.");
  }

  if (disabled) {
    return (
      <div className="rounded-[2rem] bg-slate-50 p-6 text-sm text-slate-500">
        Reviews open after the consultation is completed.
      </div>
    );
  }

  return (
    <form className="rounded-[2rem] bg-slate-50 p-6" onSubmit={submitReview}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Review your vet
      </p>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            className={`rounded-xl p-2 ${
              value <= rating ? "bg-amber-100 text-amber-600" : "bg-white text-slate-300"
            }`}
            key={value}
            onClick={() => setRating(value)}
            type="button"
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
      <input
        className="mt-4 w-full rounded-2xl border border-slate-100 px-4 py-3 text-sm outline-none focus:border-emerald-600"
        disabled={state === "saving" || state === "saved"}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Short title"
        required
        value={title}
      />
      <textarea
        className="mt-3 min-h-28 w-full rounded-2xl border border-slate-100 p-4 text-sm outline-none focus:border-emerald-600"
        disabled={state === "saving" || state === "saved"}
        minLength={10}
        onChange={(event) => setComment(event.target.value)}
        placeholder="How was the consultation?"
        required
        value={comment}
      />
      {message ? (
        <p
          className={`mt-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
            state === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </p>
      ) : null}
      <button
        className="mt-4 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white disabled:bg-slate-300"
        disabled={state === "saving" || state === "saved"}
        type="submit"
      >
        {state === "saving" ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
