/**
 * Seeds the exactly-three authorized admin users for the Kandimillets
 * Admin Portal (Phase 1). There is no public sign-up route — this script
 * is the only way admin accounts are created in this phase.
 *
 * Run with: npm run db:seed
 *
 * Credentials are read from environment variables so the placeholder
 * values below are never the ones actually used in a real deployment.
 * See .env.example for the full list.
 */
import { hashPassword } from "better-auth/crypto";
import prisma from "../src/lib/db/prisma";

interface SeedUser {
  key: string;
  name: string;
  email: string | undefined;
  password: string | undefined;
  role: "SUPER_ADMIN" | "ADMIN";
}

const seedUsers: SeedUser[] = [
  {
    key: "SHAURYA",
    name: "Shaurya",
    email: process.env.SEED_SHAURYA_EMAIL,
    password: process.env.SEED_SHAURYA_PASSWORD,
    role: "SUPER_ADMIN",
  },
  {
    key: "FATHER",
    name: "Father",
    email: process.env.SEED_FATHER_EMAIL,
    password: process.env.SEED_FATHER_PASSWORD,
    role: "SUPER_ADMIN",
  },
  {
    key: "BUSINESS",
    name: "Business Email",
    email: process.env.SEED_BUSINESS_EMAIL,
    password: process.env.SEED_BUSINESS_PASSWORD,
    role: "ADMIN",
  },
];

// Deliberately unusable if left unconfigured — forces every deployment to
// set its own SEED_*_EMAIL / SEED_*_PASSWORD values rather than silently
// seeding a guessable default credential.
function assertConfigured(user: SeedUser): asserts user is SeedUser & {
  email: string;
  password: string;
} {
  if (!user.email || !user.password) {
    throw new Error(
      `Missing SEED_${user.key}_EMAIL / SEED_${user.key}_PASSWORD environment variables. ` +
        `Set them (see .env.example) before running the seed script.`
    );
  }
  if (user.password.length < 8) {
    throw new Error(
      `SEED_${user.key}_PASSWORD must be at least 8 characters.`
    );
  }
}

async function main() {
  for (const user of seedUsers) {
    assertConfigured(user);

    const passwordHash = await hashPassword(user.password);

    const dbUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        isActive: true,
      },
      create: {
        name: user.name,
        email: user.email,
        emailVerified: true,
        role: user.role,
        isActive: true,
      },
    });

    // Better Auth stores the credential (email/password) hash on the
    // Account model, keyed by providerId: "credential". There's no
    // natural unique constraint for (userId, providerId) in Better
    // Auth's schema convention, so find-then-branch instead of upsert.
    const existingAccount = await prisma.account.findFirst({
      where: { userId: dbUser.id, providerId: "credential" },
      select: { id: true },
    });

    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: passwordHash },
      });
    } else {
      await prisma.account.create({
        data: {
          userId: dbUser.id,
          accountId: dbUser.email,
          providerId: "credential",
          password: passwordHash,
        },
      });
    }

    console.log(`Seeded admin user: ${user.name} <${user.email}> [${user.role}]`);
  }
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
