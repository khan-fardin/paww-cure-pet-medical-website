import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400"
});

const logoSrc =
  "https://i.ibb.co.com/Q3dnLpz2/Gemini-Generated-Image-ce2al6ce2al6ce2a.png";

type BrandLogoProps = {
  className?: string;
  href?: string;
  showText?: boolean;
};

export function BrandLogo({
  className,
  href = "/",
  showText = true,
}: BrandLogoProps) {
  const content = (
    <>
      <span className="relative block h-8 w-8 shrink-0 rotate-[-20deg] overflow-hidden">
        <Image src={logoSrc} alt="pawwcure" fill sizes="32px" />
      </span>
      {showText ? (
        <span className="hidden text-xl font-medium tracking-tight text-emerald-800 sm:block" style={{ fontFamily: pacifico.style.fontFamily }}>
          pawwcure
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {content}
      </div>
    );
  }

  return (
    <Link className={cn("flex items-center gap-2", className)} href={href}>
      {content}
    </Link>
  );
}
