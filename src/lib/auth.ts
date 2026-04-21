export type SignedInUser = {
  userId: string;
  email: string;
  displayName: string | null;
};

export async function getSignedInUser(): Promise<SignedInUser | null> {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return null;
  }

  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    if (!user) return null;

    const primaryEmail =
      user.emailAddresses.find((entry) => entry.id === user.primaryEmailAddressId)
        ?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;

    if (!primaryEmail) return null;

    const nameParts = [user.firstName, user.lastName].filter(
      (part): part is string => typeof part === "string" && part.trim().length > 0,
    );
    const displayName = nameParts.length > 0 ? nameParts.join(" ") : user.username ?? null;

    return {
      userId: user.id,
      email: primaryEmail,
      displayName,
    };
  } catch (err) {
    console.error("Failed to resolve Clerk user", err);
    return null;
  }
}
