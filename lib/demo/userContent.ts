export type DemoPet = {
  age: string;
  avatar: string;
  breed: string;
  conditions: string[];
  id: string;
  lastVisit: string;
  name: string;
  species: "cat" | "dog";
  weight: string;
};

export type DemoConsultation = {
  href: string;
  id: string;
  petName: string;
  scheduledAt: string;
  status: "Confirmed" | "Pending" | "Completed";
  type: "Video" | "Audio" | "Chat";
  vetName: string;
};

export type DemoReminder = {
  dueAt: string;
  id: string;
  petName: string;
  title: string;
  type: "Medicine" | "Follow-up";
};

export type DemoDocument = {
  id: string;
  label: string;
  petName: string;
  uploadedAt: string;
};

export const demoUser = {
  activePetId: "luna",
  avatar: "https://i.pravatar.cc/120?u=pawwcure-user",
  email: "nadia@example.com",
  name: "Nadia Chowdhury",
};

export const demoPets: DemoPet[] = [
  {
    age: "3 years",
    avatar:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=600",
    breed: "Persian",
    conditions: ["Sensitive stomach", "Seasonal itching"],
    id: "luna",
    lastVisit: "April 26, 2026",
    name: "Luna",
    species: "cat",
    weight: "4.8 kg",
  },
  {
    age: "5 years",
    avatar:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600",
    breed: "Golden Retriever",
    conditions: ["Hip care plan"],
    id: "buddy",
    lastVisit: "March 18, 2026",
    name: "Buddy",
    species: "dog",
    weight: "29 kg",
  },
];

export const demoConsultations: DemoConsultation[] = [
  {
    href: "/consultation/consult-001/waiting",
    id: "consult-001",
    petName: "Luna",
    scheduledAt: "Today, 7:30 PM",
    status: "Confirmed",
    type: "Video",
    vetName: "Dr. Amina Rahman",
  },
  {
    href: "/consultation/consult-002/summary",
    id: "consult-002",
    petName: "Buddy",
    scheduledAt: "April 24, 2026",
    status: "Completed",
    type: "Chat",
    vetName: "Dr. Samuel Das",
  },
];

export const demoReminders: DemoReminder[] = [
  {
    dueAt: "Today, 9:00 PM",
    id: "rem-001",
    petName: "Luna",
    title: "Give probiotic sachet",
    type: "Medicine",
  },
  {
    dueAt: "May 9, 2026",
    id: "rem-002",
    petName: "Buddy",
    title: "Follow-up mobility check",
    type: "Follow-up",
  },
];

export const demoDocuments: DemoDocument[] = [
  {
    id: "doc-001",
    label: "Luna blood panel",
    petName: "Luna",
    uploadedAt: "April 21, 2026",
  },
  {
    id: "doc-002",
    label: "Buddy x-ray report",
    petName: "Buddy",
    uploadedAt: "March 16, 2026",
  },
];

export const dashboardTimeline = [
  {
    date: "Today",
    detail: "Video consultation confirmed with Dr. Amina Rahman.",
    title: "Upcoming care",
  },
  {
    date: "April 26",
    detail: "Luna started a digestive support plan.",
    title: "Treatment updated",
  },
  {
    date: "April 21",
    detail: "Blood panel uploaded to the health vault.",
    title: "Document added",
  },
] as const;

export function getDemoPet(petId: string) {
  return demoPets.find((pet) => pet.id === petId);
}
