import { NextRequest, NextResponse } from "next/server";
import { chatMessageSchema } from "@/lib/validators";

/**
 * Rule-based FAQ assistant.
 *
 * Why rule-based and not a live LLM call: this app ships without any paid
 * API keys configured, and most of what students/canteen owners ask in the
 * first weeks of a campus app is a short, predictable FAQ set (order
 * status, payment methods, delivery mechanics, refunds). A keyword-matched
 * FAQ bot answers those instantly, for free, with no external dependency
 * or latency — a better fit for a pre-launch MVP than a paid AI call.
 *
 * To upgrade later: add ANTHROPIC_API_KEY to your environment variables,
 * then swap the `answer()` function below for a server-side call to
 * https://api.anthropic.com/v1/messages using that key. Keep this route's
 * validation and rate limiting — just replace the matching logic.
 */

type Rule = { keywords: string[]; answer: string };

const RULES: Rule[] = [
  {
    keywords: ["token", "queue", "line"],
    answer:
      "Every order gets a digital token number. Track it on your Orders page — it moves through Placed → Preparing → Ready → Picked up in real time, so you don't need to stand in line to know when it's ready.",
  },
  {
    keywords: ["where", "order", "status", "track"],
    answer:
      "You can check your live order status anytime on the 'My Orders' page in the Student portal — it updates as soon as the canteen changes it.",
  },
  {
    keywords: ["payment", "pay", "bkash", "nagad", "rocket", "card"],
    answer:
      "We support bKash, Nagad, Rocket, card, and your in-app wallet balance. Choose your method at checkout — payment confirmation happens before your order is sent to the canteen.",
  },
  {
    keywords: ["delivery", "deliver", "runner", "room", "building"],
    answer:
      "In-campus delivery is handled by student runners. Add your building, floor, and room at checkout — a GPS pin alone can't find you inside a building, so those details matter for a fast delivery.",
  },
  {
    keywords: ["refund", "cancel", "wrong order", "money back"],
    answer:
      "If something's wrong with an order, contact the canteen directly from your order details page first — most issues (wrong item, cold food) are resolved fastest that way. For payment disputes, reach out to our support email listed in the footer.",
  },
  {
    keywords: ["subscription", "price", "pricing", "commission", "fee"],
    answer:
      "Canteens choose from three plans — Basic (৳3,000/mo, no commission), Standard (৳7,000/mo + 2%), and Premium (৳15,000/mo + 4%). New partners get their first 3 months free during our pilot program. See the Pricing section on our homepage for details.",
  },
  {
    keywords: ["sold out", "stock", "available", "out of stock"],
    answer:
      "Menu availability updates live — if an item shows 'Sold out' or 'Low stock', that reflects what the canteen has right now, so you won't queue up only to find it's gone.",
  },
  {
    keywords: ["signup", "sign up", "register", "account", "join"],
    answer:
      "Students can sign up with their university email and student ID. Canteen owners sign up separately and their canteen goes live once our team approves it — usually within a day.",
  },
  {
    keywords: ["hello", "hi", "hey"],
    answer: "Hi! I'm the Campus-Crave assistant. Ask me about orders, tokens, payments, delivery, or pricing.",
  },
];

const FALLBACK =
  "I'm not sure about that one yet — for anything account-specific, please reach out to your canteen directly or our support email in the footer. I can help with questions about orders, tokens, payments, delivery, or pricing.";

function answer(message: string): string {
  const lower = message.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) {
      return rule.answer;
    }
  }
  return FALLBACK;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = chatMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const reply = answer(parsed.data.message);
  return NextResponse.json({ reply });
}
