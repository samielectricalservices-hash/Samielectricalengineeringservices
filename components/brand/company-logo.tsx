import Image from "next/image";

type CompanyLogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
};

const sizes = {
  sm: { box: "h-9 w-9", image: 28 },
  md: { box: "h-10 w-10", image: 32 },
  lg: { box: "h-12 w-12", image: 40 }
};

export function CompanyLogo({ size = "md", showText = true }: CompanyLogoProps) {
  const logoSize = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`${logoSize.box} flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-white shadow-sm`}>
        <Image
          src="/logo1.jpg"
          alt="Sami General Electric Work logo"
          width={logoSize.image}
          height={logoSize.image}
          priority={size === "lg"}
          className="h-[82%] w-[82%] object-contain"
        />
      </div>
      {showText ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-5">Sami Electrical</p>
          <p className="truncate text-xs text-muted-foreground">Engineering Services</p>
        </div>
      ) : null}
    </div>
  );
}
