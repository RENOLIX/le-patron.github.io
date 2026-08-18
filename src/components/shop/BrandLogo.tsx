import logoUrl from "@/assets/mina-logo.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  alt?: string;
}

export default function BrandLogo({
  className,
  imageClassName,
  alt = "Mina Boutique",
}: BrandLogoProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={logoUrl}
        alt={alt}
        draggable={false}
        className={cn(
          "h-full w-full object-cover object-[center_42%] scale-[1.02] select-none",
          imageClassName,
        )}
      />
    </div>
  );
}
