const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ebooks = [
  {
    slug: "creative-problem-solving",
    title: "Creative Problem Solving",
    author: "Nina Santos",
    category: "Entrepreneurship",
    description:
      "A practical guide to finding everyday problems and turning them into small venture ideas.",
    pages: 84,
    publishedYear: 2026,
    isPremium: false
  },
  {
    slug: "student-startup-basics",
    title: "Student Startup Basics",
    author: "Miguel Cruz",
    category: "Business",
    description:
      "Simple frameworks for validating ideas, interviewing users, and planning a beginner-friendly business.",
    pages: 112,
    publishedYear: 2025,
    isPremium: true
  },
  {
    slug: "digital-study-systems",
    title: "Digital Study Systems",
    author: "Leah Ramos",
    category: "Productivity",
    description:
      "Build better study habits using simple digital tools, notes, reminders, and weekly reviews.",
    pages: 76,
    publishedYear: 2024,
    isPremium: false
  },
  {
    slug: "community-research-fieldbook",
    title: "Community Research Fieldbook",
    author: "Rafa Dizon",
    category: "Research",
    description:
      "Question prompts and observation templates for discovering real-life community problems.",
    pages: 95,
    publishedYear: 2026,
    isPremium: true
  },
  {
    slug: "budgeting-for-teens",
    title: "Budgeting for Teens",
    author: "Amara Lim",
    category: "Finance",
    description:
      "A friendly introduction to saving, planning expenses, and making small money decisions responsibly.",
    pages: 68,
    publishedYear: 2025,
    isPremium: false
  },
  {
    slug: "pitch-deck-playbook",
    title: "Pitch Deck Playbook",
    author: "Paolo Mercado",
    category: "Entrepreneurship",
    description:
      "A short guide for presenting problems, solutions, target users, and project feasibility.",
    pages: 89,
    publishedYear: 2026,
    isPremium: true
  }
];

async function main() {
  await Promise.all(
    ebooks.map((ebook) =>
      prisma.ebook.upsert({
        where: { slug: ebook.slug },
        update: ebook,
        create: ebook
      })
    )
  );

  await prisma.user.upsert({
    where: { email: "student@bookbridge.test" },
    update: {},
    create: {
      name: "Student Demo",
      email: "student@bookbridge.test",
      passwordHash: "demo-only-student123"
    }
  });

  const premiumUser = await prisma.user.upsert({
    where: { email: "premium@bookbridge.test" },
    update: { subscriptionStatus: "ACTIVE" },
    create: {
      name: "Premium Demo",
      email: "premium@bookbridge.test",
      passwordHash: "demo-only-premium123",
      subscriptionStatus: "ACTIVE",
      subscriptionEndsAt: new Date("2026-12-31T23:59:59.000Z")
    }
  });

  await prisma.subscription.upsert({
    where: { id: "demo-premium-subscription" },
    update: {
      status: "ACTIVE",
      currentPeriodEnd: new Date("2026-12-31T23:59:59.000Z")
    },
    create: {
      id: "demo-premium-subscription",
      userId: premiumUser.id,
      provider: "mock",
      providerReference: "fake-school-demo",
      status: "ACTIVE",
      currentPeriodEnd: new Date("2026-12-31T23:59:59.000Z")
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
