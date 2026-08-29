"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Loader2, Store } from "lucide-react";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Role = "student" | "canteen_manager";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = (params.get("role") as Role) || "student";
  const [role, setRole] = useState<Role>(
    initialRole === "canteen_manager" ? "canteen_manager" : "student"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  // student-only
  const [university, setUniversity] = useState("");
  const [studentIdNumber, setStudentIdNumber] = useState("");
  // canteen-only
  const [canteenName, setCanteenName] = useState("");
  const [campus, setCampus] = useState("");
  const [location, setLocation] = useState("");
  const [subscriptionTier, setSubscriptionTier] = useState<"basic" | "standard" | "premium">(
    "basic"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload =
      role === "student"
        ? { role, name, email, password, phone, university, studentIdNumber }
        : { role, name, email, password, phone, canteenName, campus, location, subscriptionTier };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      router.push(data.redirect || "/");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-6 bg-periwinkle-tint p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setRole("student")}
          className={`flex items-center justify-center gap-2 font-display font-semibold text-sm py-2.5 rounded-xl transition-all ${
            role === "student" ? "bg-ink text-cream shadow-sm" : "text-ink-soft"
          }`}
        >
          <GraduationCap size={16} /> Student
        </button>
        <button
          type="button"
          onClick={() => setRole("canteen_manager")}
          className={`flex items-center justify-center gap-2 font-display font-semibold text-sm py-2.5 rounded-xl transition-all ${
            role === "canteen_manager" ? "bg-ink text-cream shadow-sm" : "text-ink-soft"
          }`}
        >
          <Store size={16} /> Canteen owner
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-chili-tint text-chili text-sm font-medium rounded-xl px-4 py-3">
            {error}
          </div>
        )}
        <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="At least 8 characters."
        />
        <Input
          label="Phone (optional)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01XXXXXXXXX"
        />

        {role === "student" ? (
          <>
            <Input
              label="University"
              required
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder="e.g. Dhaka University"
            />
            <Input
              label="Student ID (optional)"
              value={studentIdNumber}
              onChange={(e) => setStudentIdNumber(e.target.value)}
            />
          </>
        ) : (
          <>
            <Input
              label="Canteen name"
              required
              value={canteenName}
              onChange={(e) => setCanteenName(e.target.value)}
              placeholder="e.g. Central Canteen"
            />
            <Input
              label="Campus"
              required
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              placeholder="e.g. Dhaka University"
            />
            <Input
              label="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Kala Bhaban"
            />
            <Select
              label="Starting plan"
              value={subscriptionTier}
              onChange={(e) => setSubscriptionTier(e.target.value as typeof subscriptionTier)}
              hint="You can change this anytime. First 3 months are free during our pilot."
            >
              <option value="basic">Basic — ৳3,000/mo</option>
              <option value="standard">Standard — ৳7,000/mo + 2%</option>
              <option value="premium">Premium — ৳15,000/mo + 4%</option>
            </Select>
            <p className="text-xs text-ink-soft -mt-1.5 bg-periwinkle-tint rounded-lg px-3 py-2.5">
              New canteens are reviewed by our team before going live — usually
              within a day.
            </p>
          </>
        )}

        <Button type="submit" disabled={loading} className="mt-1.5 w-full">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-ink-soft mt-1">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-periwinkle-deep">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
