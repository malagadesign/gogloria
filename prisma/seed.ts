import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding QR Studio...");

  await prisma.qrScan.deleteMany();
  await prisma.qrCode.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();
  await prisma.client.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 12);

  const mozoo = await prisma.client.create({
    data: {
      name: "Mozoo",
      slug: "mozoo",
      logoUrl: null,
    },
  });

  const achaval = await prisma.client.create({
    data: {
      name: "Achával Cornejo",
      slug: "achaval-cornejo",
    },
  });

  const agencia = await prisma.client.create({
    data: {
      name: "Agencia Gloria",
      slug: "agencia-gloria",
    },
  });

  await prisma.user.createMany({
    data: [
      {
        name: "Admin Gloria",
        email: "admin@agenciagloria.com",
        passwordHash,
        role: "ADMIN",
      },
      {
        name: "Equipo Mozoo",
        email: "mozoo@demo.com",
        passwordHash,
        role: "CLIENT",
        clientId: mozoo.id,
      },
      {
        name: "Equipo Achával",
        email: "achaval@demo.com",
        passwordHash,
        role: "CLIENT",
        clientId: achaval.id,
      },
    ],
  });

  const mozooCarta = await prisma.campaign.create({
    data: {
      clientId: mozoo.id,
      name: "Carta digital",
      slug: "carta-digital",
      description: "Menú y carta del restaurante",
    },
  });

  const mozooDelivery = await prisma.campaign.create({
    data: {
      clientId: mozoo.id,
      name: "Delivery inteligente",
      slug: "delivery-inteligente",
    },
  });

  const achavalEmprendimientos = await prisma.campaign.create({
    data: {
      clientId: achaval.id,
      name: "Emprendimientos",
      slug: "emprendimientos",
    },
  });

  const achavalNewsletter = await prisma.campaign.create({
    data: {
      clientId: achaval.id,
      name: "Newsletter",
      slug: "newsletter",
    },
  });

  const gloriaEventos = await prisma.campaign.create({
    data: {
      clientId: agencia.id,
      name: "Eventos",
      slug: "eventos",
    },
  });

  await prisma.qrCode.createMany({
    data: [
      {
        clientId: mozoo.id,
        campaignId: mozooCarta.id,
        name: "Carta restaurante demo",
        slug: "carta-restaurante-demo",
        destinationUrl: "https://mozoo.com.ar/carta",
        type: "MENU",
        status: "ACTIVE",
      },
      {
        clientId: mozoo.id,
        campaignId: mozooDelivery.id,
        name: "Promo WhatsApp",
        slug: "promo-whatsapp-mozoo",
        destinationUrl: "https://wa.me/5491112345678",
        type: "WHATSAPP",
        status: "ACTIVE",
      },
      {
        clientId: mozoo.id,
        campaignId: mozooCarta.id,
        name: "Google Reviews",
        slug: "google-reviews-mozoo",
        destinationUrl: "https://g.page/r/mozoo/review",
        type: "REVIEWS",
        status: "ACTIVE",
      },
      {
        clientId: achaval.id,
        campaignId: achavalEmprendimientos.id,
        name: "Ficha emprendimiento demo",
        slug: "ficha-emprendimiento-demo",
        destinationUrl: "https://achavalcornejo.com/emprendimientos/demo",
        type: "PROPERTY",
        status: "ACTIVE",
      },
      {
        clientId: achaval.id,
        campaignId: achavalNewsletter.id,
        name: "Contacto WhatsApp comercial",
        slug: "whatsapp-comercial-achaval",
        destinationUrl: "https://wa.me/5491198765432",
        type: "WHATSAPP",
        status: "ACTIVE",
      },
      {
        clientId: agencia.id,
        campaignId: gloriaEventos.id,
        name: "Portfolio agencia",
        slug: "portfolio-agencia-gloria",
        destinationUrl: "https://agenciagloria.com/portfolio",
        type: "WEBSITE",
        status: "ACTIVE",
      },
      {
        clientId: agencia.id,
        campaignId: gloriaEventos.id,
        name: "Contacto comercial",
        slug: "contacto-comercial-gloria",
        destinationUrl: "https://agenciagloria.com/contacto",
        type: "WEBSITE",
        status: "ACTIVE",
      },
    ],
  });

  console.log("✅ Seed completado");
  console.log("");
  console.log("Usuarios demo:");
  console.log("  admin@agenciagloria.com / demo1234 (ADMIN)");
  console.log("  mozoo@demo.com / demo1234 (CLIENT Mozoo)");
  console.log("  achaval@demo.com / demo1234 (CLIENT Achával)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
