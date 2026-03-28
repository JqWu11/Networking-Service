import { PricingTable } from "@clerk/nextjs";

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function PricingPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem 2rem" }}>
      <h1
        style={{
          marginTop: "2rem",
          marginBottom: "0.5rem",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        Pricing for OutreachPilot
      </h1>
      <p style={{ marginBottom: "1.25rem", color: "#475569" }}>
        Choose the plan that matches your outreach volume and follow-up workflow.
      </p>
      {clerkEnabled ? (
        <PricingTable />
      ) : (
        <p style={{ color: "#475569" }}>
          Billing is unavailable in local demo mode. Add Clerk keys to enable
          checkout.
        </p>
      )}
    </div>
  );
}