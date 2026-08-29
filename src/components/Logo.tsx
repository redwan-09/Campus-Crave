import Image from "next/image";
import Link from "next/link";

export function Logo({
  size = 34,
  showText = true,
  href = "/",
}: {
  size?: number;
  showText?: boolean;
  href?: string;
}) {
  const content = (
    <span className="flex items-center gap-2.5">
      <Image
        src="/logo.png"
        alt="Campus-Crave logo"
        width={size}
        height={size}
        className="object-contain"
        style={{ width: size, height: size }}
        priority
      />
      {showText && (
        <span className="font-display font-bold text-lg tracking-tight text-ink">
          Campus-Crave
        </span>
      )}
    </span>
  );
  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
