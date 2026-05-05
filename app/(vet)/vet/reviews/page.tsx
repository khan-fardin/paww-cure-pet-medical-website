import type { Metadata } from "next";
import { Flag, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "My Reviews | pawwcure",
};

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default function ReviewsPage() {
  const reviews = [
    {
      id: "rev-001",
      ownerName: "Nadia Chowdhury",
      petName: "Luna",
      rating: 5,
      text: "Dr. Amina was amazing! She took time to understand Luna's issues and gave clear instructions. Will definitely book again!",
      date: "May 1, 2026",
    },
    {
      id: "rev-002",
      ownerName: "Ahmed Khan",
      petName: "Max",
      rating: 4,
      text: "Good consultation, very professional. Only minor note - session could have been a bit longer.",
      date: "April 28, 2026",
    },
    {
      id: "rev-003",
      ownerName: "Sara Islam",
      petName: "Whiskers",
      rating: 5,
      text: "Excellent vet! Very knowledgeable about cat nutrition. Highly recommended.",
      date: "April 25, 2026",
    },
  ];

  const avgRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Reviews</h1>
        <p className="mt-2 text-slate-500">
          See what your patients think about your service
        </p>
      </div>

      <Card>
        <div className="text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                className={`h-6 w-6 ${
                  i < Math.floor(parseFloat(avgRating))
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
                key={i}
              />
            ))}
          </div>
          <p className="text-5xl font-bold">{avgRating}</p>
          <p className="mt-2 text-slate-500">Based on {reviews.length} reviews</p>
        </div>
      </Card>

      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-bold">{review.ownerName}</p>
                    <p className="text-sm text-slate-500">
                      {review.petName} • {review.date}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                      key={i}
                    />
                  ))}
                </div>

                <p className="mt-3 text-slate-600">{review.text}</p>
              </div>

              <button
                className="text-slate-400 hover:text-amber-500 transition"
                title="Flag as inappropriate"
              >
                <Flag className="h-5 w-5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
