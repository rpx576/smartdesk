import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/server/auth/password";

/**
 * Development seed: two organizations with separate users and clients, so
 * tenant isolation can be exercised locally. Ids are fixed so they are easy
 * to reference. Safe to run repeatedly.
 *
 * Every seeded user gets the password from SEED_USER_PASSWORD (see .env.example).
 */
const ids = {
  acme: "018f0000-0000-7000-8000-000000000001",
  globex: "018f0000-0000-7000-8000-000000000002",
  acmeAdmin: "018f0000-0000-7000-8000-000000000011",
  acmeEmployee: "018f0000-0000-7000-8000-000000000012",
  acmeClient: "018f0000-0000-7000-8000-000000000013",
  globexAdmin: "018f0000-0000-7000-8000-000000000021",
  acmeWebsite: "018f0000-0000-7000-8000-000000000101",
  acmeMaintenance: "018f0000-0000-7000-8000-000000000102",
  globexMigration: "018f0000-0000-7000-8000-000000000201",
};

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("The development seed must not run in production");
  }
  const password = process.env.SEED_USER_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error("SEED_USER_PASSWORD must be set (at least 12 characters)");
  }
  const passwordHash = await hashPassword(password);

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
    await prisma.user.upsert({
      where: { id },
      update: { passwordHash },
      create: { id, email, name, passwordHash },
    });
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
  const clientIds: Record<string, string> = {};
  for (const client of clients) {
    const saved = await prisma.client.upsert({
      where: {
        organizationId_email: { organizationId: client.organizationId, email: client.email },
      },
      update: {},
      create: client,
    });
    clientIds[client.email] = saved.id;
  }

  const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
  const projects = [
    {
      id: ids.acmeWebsite,
      organizationId: ids.acme,
      clientId: clientIds["contacto@bodegasrioja.test"],
      createdById: ids.acmeAdmin,
      name: "Nueva tienda online",
      description: "Tienda online para la venta directa de vinos con pasarela de pago.",
      status: "ACTIVE",
      priority: "HIGH",
      startDate: day("2026-09-01"),
      dueDate: day("2026-12-15"),
      budget: 18500,
      estimatedHours: 320,
    },
    {
      id: ids.acmeMaintenance,
      organizationId: ids.acme,
      clientId: clientIds["info@talleresmartin.test"],
      createdById: ids.acmeEmployee,
      name: "Plan de mantenimiento anual",
      status: "PLANNING",
      priority: "MEDIUM",
      startDate: day("2027-01-10"),
    },
    {
      id: ids.globexMigration,
      organizationId: ids.globex,
      clientId: clientIds["hello@initech.test"],
      createdById: ids.globexAdmin,
      name: "Migración a la nube",
      status: "ACTIVE",
      priority: "CRITICAL",
      budget: 42000,
    },
  ] as const;
  for (const project of projects) {
    await prisma.project.upsert({ where: { id: project.id }, update: {}, create: project });
  }

  console.log("Seed completed", ids);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
