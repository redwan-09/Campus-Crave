import { Logo } from "@/components/Logo";
import Image from "next/image";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-cream">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-cream p-12 relative overflow-hidden">
        <div
          className="absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(110,127,224,0.35), transparent 70%)" }}
        />
        
        
        <div className="relative my-auto py-6">
          <h2 className="font-display font-bold text-4xl leading-tight mb-4">
            Skip the line.
            <br />
            Not the class.
          </h2>

          {/* Floating Logo */}
          <div
            className="hidden xl:block absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none animate-float"
            style={{ animationDuration: "8s" }}
          >
            <Image
              src="/logo.png"
              alt=""
              width={200}
              height={200}
              className="object-contain opacity-[0.14]"
              style={{ width: 200, height: 200 }}
            />
          </div>

          <p className="text-cream/60 text-[15px] max-w-sm leading-relaxed">
            Pre-order, digital tokens, and in-campus delivery -- built for
            Bangladeshi university canteens.
          </p>
        </div>

        <div className="relative bg-white/[0.06] border border-white/10 rounded-2xl p-5">
          <p className="text-[13px] text-cream/70 leading-relaxed">
            <strong className="text-cream">Trying the demo?</strong> Use{" "}
            <code className="text-marigold">student@campuscrave.app</code>,{" "}
            <code className="text-marigold">canteen@campuscrave.app</code>, or{" "}
            <code className="text-marigold">admin@campuscrave.app</code> —
            password <code className="text-marigold">Demo@1234</code> — after
            running the seed script.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <h1 className="font-display font-bold text-[28px] mb-1.5">{title}</h1>
          <p className="text-ink-soft text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}