export const TRIAL_DAYS = 14;

export const PLANS = {
  free: {
    name: "free" as const,
    price: 0,
    description: "Explore the basics at no cost",
    features: ["10 credits per month", "1 project", "Basic models only", "Community support"],
  },
  pro: {
    name: "pro" as const,
    price: 25,
    annualPrice: 20,
    description: "More credits, more models, more power",
    limits: {
      credits: 100,
    },
    features: [
      "100 credits per month",
      "Unlimited projects",
      "All models including GPT-4o & Claude",
      `${TRIAL_DAYS}-day free trial`,
      "Buy additional credits at provider rates",
      "Priority support",
    ],
  },
  max: {
    name: "max" as const,
    price: 100,
    annualPrice: 80,
    description: "Maximum throughput for heavy usage",
    limits: {
      credits: 500,
    },
    features: [
      "500 credits per month",
      "Everything in Pro",
      "Higher rate limits",
      `${TRIAL_DAYS}-day free trial`,
      "Discounted additional credits",
      "Advanced usage analytics",
      "Dedicated support",
    ],
  },
} as const;

export type PlanName = keyof typeof PLANS;
