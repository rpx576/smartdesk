import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Development seed: two organizations with separate users and clients, so
 * tenant isolation can be exercised locally. Ids are fixed to make the
 * `x-dev-user-id` header easy to use. Safe to run repeatedly.
 */
const ids = {
  acme: "018f0000-0000-7000-8000-000000000001",
  globex: "018f0000-0000-7000-8000-000000000002",
  acmeAdmin: "018f0000-0000-7000-8000-000000000011",
  acmeEmployee: "018f0000-0000-7000-8000-000000000012",
  acmeClient: "018f0000-0000-7000-8000-000000000013",
  globexAdmin: "018f0000-0000-7000-8000-000000000021",
};

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed must not run in production");
  }

  const organizations = [
    { id: ids.acme, name: "Acme S.L.", slug: "acme" },
    { id: ids.globex, name: "Globex Corp", slug: "globex" },
  ];
  for (const organization of organizations) {
    await prisma.organization.upsert({
      where: { id: organization.id },
      update: {},
      create: organization,
    });
  }

  const users = [
    { id: ids.acmeAdmin, email: "admin@acme.test", name: "Ana Admin", org: ids.acme, role: "ADMIN" },
    { id: ids.acmeEmployee, email: "employee@acme.test", name: "Eva Employee", org: ids.acme, role: "EMPLOYEE" },
    { id: ids.acmeClient, email: "client@acme.test", name: "Carlos Client", org: ids.acme, role: "CLIENT" },
    { id: ids.globexAdmin, email: "admin@globex.test", name: "Gus Admin", org: ids.globex, role: "ADMIN" },
  ] as const;
  for (const { id, email, name, org, role } of users) {
    await prisma.user.upsert({ where: { id }, update: {}, create: { id, email, name } });
    await prisma.membership.upsert({
      where: { userId_organizationId: { userId: id, organizationId: org } },
      update: { role },
      create: { userId: id, organizationId: org, role },
    });
  }

  const clients = [
    { organizationId: ids.acme, name: "Bodegas Rioja", email: "contacto@bodegasrioja.test", company: "Bodegas Rioja S.A." },
    { organizationId: ids.acme, name: "Talleres Martín", email: "info@talleresmartin.test", status: "LEAD" },
    { organizationId: ids.globex, name: "Initech", email: "hello@initech.test", company: "Initech LLC" },
  ] as const;
  for (const client of clients) {
    await prisma.client.upsert({
      where: {
        organizationId_email: { organizationId: client.organizationId, email: client.email },
      },
      update: {},
      create: client,
    });
  }

  console.log("Seed completed", ids);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
