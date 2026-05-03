import { BrandLogo } from "@/components/layout/BrandLogo";

const footerColumns = [
  {
    title: "Platform",
    links: [
      { href: "/#care", label: "Video Consult" },
      { href: "/#care", label: "Prescriptions" },
      { href: "/vets", label: "Vet Search" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/articles", label: "Articles" },
      { href: "/apply-as-vet", label: "Careers" },
      { href: "/#reviews", label: "Press" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/#privacy", label: "Privacy Policy" },
      { href: "/#terms", label: "Terms of Service" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white px-6 pb-10 pt-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 grid grid-cols-2 gap-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <BrandLogo className="mb-4" href="" />
            <p className="text-sm leading-relaxed text-slate-400">
              Redefining animal health through technology and empathy.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-6 font-bold">{column.title}</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <a className="hover:text-emerald-600" href={link.href}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
          &copy; 2026 pawwcure Technologies Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
