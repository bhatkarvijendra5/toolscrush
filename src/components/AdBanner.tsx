interface AdBannerProps {
  variant?: "banner" | "mid-content" | "bottom";
  className?: string;
}

const AdBanner = ({ variant = "banner", className = "" }: AdBannerProps) => {
  const variantStyles = {
    banner: "max-w-[728px] min-h-[90px] md:min-h-[90px] min-h-[50px]",
    "mid-content": "max-w-3xl min-h-[250px] md:min-h-[250px] min-h-[200px]",
    bottom: "max-w-[728px] min-h-[90px] md:min-h-[90px] min-h-[50px]",
  };

  return (
    <div className={`w-full flex justify-center py-3 md:py-4 ${className}`}>
      <div
        className={`w-full ${variantStyles[variant]} mx-auto flex items-center justify-center rounded-lg border border-border/50 bg-muted/30 text-muted-foreground text-xs tracking-wide select-none`}
      >
        Ad Space
      </div>
    </div>
  );
};

export default AdBanner;
