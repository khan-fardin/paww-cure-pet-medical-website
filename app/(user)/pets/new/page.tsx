import type { Metadata } from "next";

import { UserPageScaffold } from "@/components/user/UserPageScaffold";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export const metadata: Metadata = {
  title: "Add Pet | pawwcure",
};

export default function NewPetPage() {
  return (
    <UserPageScaffold
      description="Frontend skeleton for the pet creation form. Validation and API submission will connect to the pet service later."
      eyebrow="New pet"
      title="Add a pet"
    >
      <form className="grid gap-6 rounded-[2.5rem] border border-slate-100 bg-white p-7 shadow-sm md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Pet name
          </span>
          <Input placeholder="Luna" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Species
          </span>
          <Input placeholder="cat or dog" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Breed
          </span>
          <Input placeholder="Persian" />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Weight
          </span>
          <Input placeholder="4.8 kg" />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Notes
          </span>
          <Textarea placeholder="Allergies, conditions, habits, or current food plan." />
        </label>
        <div className="md:col-span-2">
          <Button type="button">Save Pet</Button>
        </div>
      </form>
    </UserPageScaffold>
  );
}
