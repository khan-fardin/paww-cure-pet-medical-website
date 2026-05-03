export type VetProfile = {
  availability: string;
  avatar: string;
  bio: string;
  consultFee: string;
  education: string;
  id: string;
  languages: string[];
  location: string;
  name: string;
  nextSlot: string;
  rating: number;
  ratingCount: number;
  specialties: string[];
  yearsExperience: number;
};

export type DemoArticle = {
  author: string;
  body: string[];
  category: "Cat care" | "Dog care" | "Wellness" | "Emergency";
  heroImage: string;
  minutesToRead: number;
  publishedAt: string;
  slug: string;
  summary: string;
  tags: string[];
  title: string;
};

export const demoVets: VetProfile[] = [
  {
    availability: "Video, audio, and chat",
    avatar: "https://i.pravatar.cc/240?u=vet-amina",
    bio: "Dr. Amina focuses on preventive care, practical nutrition plans, and calm first consultations for anxious pets.",
    consultFee: "BDT 1,200",
    education: "DVM, Chattogram Veterinary and Animal Sciences University",
    id: "amina-rahman",
    languages: ["Bangla", "English"],
    location: "Dhaka, Bangladesh",
    name: "Dr. Amina Rahman",
    nextSlot: "Today, 7:30 PM",
    rating: 4.9,
    ratingCount: 218,
    specialties: ["General practice", "Nutrition", "Preventive care"],
    yearsExperience: 9,
  },
  {
    availability: "Video consultations",
    avatar: "https://i.pravatar.cc/240?u=vet-samuel",
    bio: "Dr. Samuel supports skin, allergy, and ear cases with clear treatment plans and follow-up friendly notes.",
    consultFee: "BDT 1,450",
    education: "DVM, Bangladesh Agricultural University",
    id: "samuel-das",
    languages: ["Bangla", "English"],
    location: "Sylhet, Bangladesh",
    name: "Dr. Samuel Das",
    nextSlot: "Tomorrow, 11:00 AM",
    rating: 4.8,
    ratingCount: 164,
    specialties: ["Dermatology", "Allergies", "Ear care"],
    yearsExperience: 7,
  },
  {
    availability: "Video and audio",
    avatar: "https://i.pravatar.cc/240?u=vet-farzana",
    bio: "Dr. Farzana specializes in puppy and kitten care, vaccine planning, and long-term wellness routines.",
    consultFee: "BDT 1,100",
    education: "DVM, Sher-e-Bangla Agricultural University",
    id: "farzana-huq",
    languages: ["Bangla", "English", "Hindi"],
    location: "Rajshahi, Bangladesh",
    name: "Dr. Farzana Huq",
    nextSlot: "Today, 9:00 PM",
    rating: 4.9,
    ratingCount: 192,
    specialties: ["Puppy care", "Kitten care", "Vaccines"],
    yearsExperience: 8,
  },
  {
    availability: "Emergency video triage",
    avatar: "https://i.pravatar.cc/240?u=vet-ryan",
    bio: "Dr. Ryan helps users decide what needs urgent clinic care and what can be monitored safely at home.",
    consultFee: "BDT 1,800",
    education: "DVM, University of Veterinary Medicine",
    id: "ryan-kabir",
    languages: ["English", "Bangla"],
    location: "Chattogram, Bangladesh",
    name: "Dr. Ryan Kabir",
    nextSlot: "In 45 minutes",
    rating: 4.7,
    ratingCount: 141,
    specialties: ["Emergency triage", "Surgery follow-up", "Pain care"],
    yearsExperience: 11,
  },
];

export const demoArticles: DemoArticle[] = [
  {
    author: "pawwcure Clinical Team",
    body: [
      "A useful pet health vault starts with the basics: vaccine history, recent medications, allergy notes, weight changes, and any lab reports or discharge summaries. Keeping those details close makes every consultation faster and less stressful.",
      "For each document, add a short label that explains what it is and when it was created. A photo of a prescription is easier to use later when it is named clearly, such as ear infection prescription, April 2026.",
      "Update the vault after every consultation. Small changes, like a new food sensitivity or a changed dose, are easy to forget but can matter a lot during urgent care.",
    ],
    category: "Wellness",
    heroImage:
      "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?auto=format&fit=crop&q=80&w=1200",
    minutesToRead: 4,
    publishedAt: "April 28, 2026",
    slug: "build-a-pet-health-vault",
    summary:
      "A simple checklist for organizing records, prescriptions, allergies, and care notes before the next vet call.",
    tags: ["Records", "Preparation", "Consultations"],
    title: "How to build a useful pet health vault",
  },
  {
    author: "Dr. Amina Rahman",
    body: [
      "Not every symptom means an emergency visit, but some signs deserve immediate attention. Trouble breathing, repeated seizures, collapse, severe bleeding, or suspected poisoning should be treated as urgent.",
      "Video triage can help when symptoms are unclear. A vet can ask targeted questions, observe breathing, gum color, posture, and energy level, then guide the next step.",
      "When in doubt, prepare the details before reaching out: when symptoms started, what changed, what your pet ate, and any medicines already given.",
    ],
    category: "Emergency",
    heroImage:
      "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1200",
    minutesToRead: 5,
    publishedAt: "April 24, 2026",
    slug: "when-to-book-emergency-video-triage",
    summary:
      "Clear warning signs that need fast attention, plus what to prepare before a triage consultation.",
    tags: ["Emergency", "Video care", "Symptoms"],
    title: "When to book emergency video triage",
  },
  {
    author: "pawwcure Nutrition Desk",
    body: [
      "Sudden diet changes are one of the common causes of digestive upset. If your vet recommends a new food, transition slowly unless there is a medical reason to switch immediately.",
      "A gradual transition usually means mixing a small amount of the new food into the current food, then increasing that share over several days. Watch appetite, stool quality, energy, and itching.",
      "Pets with chronic conditions need a plan tailored to their diagnosis, age, weight, and medicine schedule. Keep your notes updated so follow-up consultations have the full picture.",
    ],
    category: "Dog care",
    heroImage:
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=1200",
    minutesToRead: 3,
    publishedAt: "April 19, 2026",
    slug: "switching-pet-food-safely",
    summary:
      "A low-stress approach to food transitions and what to monitor during the first week.",
    tags: ["Nutrition", "Digestive health", "Wellness"],
    title: "Switching pet food without upsetting their stomach",
  },
];

export function getDemoVet(vetId: string) {
  return demoVets.find((vet) => vet.id === vetId);
}

export function getDemoArticle(slug: string) {
  return demoArticles.find((article) => article.slug === slug);
}
