const crypto = require("node:crypto");
const { copyFile, mkdir } = require("node:fs/promises");
const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const ebookSourceDir =
  process.env.EBOOK_SOURCE_DIR ||
  String.raw`C:\Users\JP Pacho\Downloads\drive-download-20260516T140721Z-3-001`;
const publicEbookDir = path.join(__dirname, "..", "public", "uploads", "ebooks");

function hashPassword(password, salt = crypto.randomBytes(16).toString("base64url")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("base64url");
  return `scrypt:${salt}:${hash}`;
}

function countPdfPages(filePath) {
  try {
    const text = readFileSync(filePath).toString("latin1");
    const matches = text.match(/\/Type\s*\/Page\b/g);
    return matches?.length || null;
  } catch {
    return null;
  }
}

async function copyPdfIfAvailable(ebook) {
  if (!ebook.fileName) {
    return ebook.fileUrl ?? null;
  }

  const sourceFile = path.join(ebookSourceDir, ebook.fileName);

  if (!existsSync(sourceFile)) {
    console.warn(`PDF source missing: ${sourceFile}`);
    return ebook.fileUrl ?? null;
  }

  await mkdir(publicEbookDir, { recursive: true });

  const destinationFile = path.join(publicEbookDir, `${ebook.slug}.pdf`);

  if (!existsSync(destinationFile)) {
    await copyFile(sourceFile, destinationFile);
  }

  return `/uploads/ebooks/${ebook.slug}.pdf`;
}

const ebooks = [
  {
    slug: "vibration-engineering-rao",
    title: "Vibration Engineering",
    author: "S. S. Rao",
    category: "Mechanical Engineering",
    description:
      "Engineering reference for vibration fundamentals, response analysis, and mechanical system modeling.",
    pages: 700,
    publishedYear: 2011,
    isPremium: true,
    fileName: "VIBRATION ENGINEERING- Rao.pdf"
  },
  {
    slug: "fe-electrical-computer-practice-problems",
    title: "FE Electrical and Computer Practice Problems",
    author: "Michael R. Lindeburg",
    category: "Electrical Engineering",
    description:
      "Practice problems for FE Electrical and Computer exam preparation across core engineering topics.",
    pages: 460,
    publishedYear: 2017,
    isPremium: true,
    fileName:
      "Michael  R. Lindeburg PE - FE Electrical and Computer Practice Problems-Professional Publications, Inc. (2017).pdf"
  },
  {
    slug: "shigleys-mechanical-engineering-design",
    title: "Shigley's Mechanical Engineering Design",
    author: "Richard G. Budynas and J. Keith Nisbett",
    category: "Mechanical Design",
    description:
      "Mechanical design reference covering failure theories, machine components, shafts, bearings, gears, and design factors.",
    pages: 1100,
    publishedYear: 2011,
    isPremium: true,
    fileName: "Shigley_s Mechanical Engineering Design.pdf"
  },
  {
    slug: "structural-analysis-instructor-solutions-manual",
    title: "Structural Analysis Instructor Solutions Manual",
    author: "Russell C. Hibbeler",
    category: "Civil Engineering",
    description:
      "Instructor solutions companion for structural analysis problems, methods, and worked engineering examples.",
    pages: 700,
    publishedYear: 2011,
    isPremium: true,
    fileName:
      "Russell Charles Hibbeler - Structural Analysis - Intructor Solutions manual-Pearson Education (Prentice Hall) (2011).pdf"
  },
  {
    slug: "engineering-mechanics-statics-dynamics",
    title: "Engineering Mechanics: Combined Statics and Dynamics",
    author: "Russell C. Hibbeler",
    category: "Engineering Mechanics",
    description:
      "Combined statics and dynamics text for force systems, equilibrium, motion, kinetics, and rigid body mechanics.",
    pages: 1400,
    publishedYear: 2009,
    isPremium: false,
    fileName:
      "Russell C. Hibbeler - Engineering Mechanics--Combined Statics & Dynamics, 12th Edition  -Prentice Hall (2009).pdf"
  },
  {
    slug: "marks-standard-handbook-mechanical-engineers",
    title: "Marks' Standard Handbook for Mechanical Engineers",
    author: "Eugene A. Avallone, Theodore Baumeister, and Ali Sadegh",
    category: "Mechanical Engineering",
    description:
      "Broad mechanical engineering handbook with formulas, tables, standards, and practical engineering reference material.",
    pages: 1800,
    publishedYear: 2006,
    isPremium: true,
    fileName: "Mark_s Standard Handbook for Mechanical Engineers.pdf"
  },
  {
    slug: "machine-elements-in-mechanical-design",
    title: "Machine Elements in Mechanical Design",
    author: "Robert L. Mott",
    category: "Mechanical Design",
    description:
      "Machine element design text covering stresses, shafts, bearings, gears, springs, fasteners, and drive components.",
    pages: 864,
    publishedYear: 2004,
    isPremium: true,
    fileName:
      "Robert L. Mott - Machine Elements in Mechanical Design (4th Edition) (2004, Prentice Hall) - libgen.lc.pdf"
  },
  {
    slug: "mechanics-of-materials-9e",
    title: "Mechanics of Materials",
    author: "Russell C. Hibbeler",
    category: "Materials and Structures",
    description:
      "Mechanics of materials text for stress, strain, torsion, bending, deflection, columns, and combined loading.",
    pages: 900,
    publishedYear: 2014,
    isPremium: false,
    fileName: "Mechanics of Materials 9e..pdf"
  },
  {
    slug: "civil-engineering-reference-manual-pe-exam",
    title: "Civil Engineering Reference Manual for the PE Exam",
    author: "Michael R. Lindeburg",
    category: "Civil Engineering",
    description:
      "Civil PE exam reference manual covering breadth and depth topics for professional engineering review.",
    pages: 1500,
    publishedYear: 2014,
    isPremium: true,
    fileName:
      "Michael R. Lindeburg - Civil Engineering Reference Manual for the PE Exam (2014, Professional Publications, Inc.) - libgen.lc.pdf"
  },
  {
    slug: "fluid-mechanics-fundamentals-applications",
    title: "Fluid Mechanics: Fundamentals and Applications",
    author: "Yunus A. Cengel and John M. Cimbala",
    category: "Fluid Mechanics",
    description:
      "Fluid mechanics textbook covering properties, pressure, control volumes, flow in pipes, turbomachinery, and applications.",
    pages: 1024,
    publishedYear: 2014,
    isPremium: false,
    fileName: "Fluid Mechanics - Fundamentals and Applications 3rd Edition [Cengel and Cimbala-2014].pdf"
  }
];

async function main() {
  await Promise.all(
    ebooks.map(async ({ fileName, ...ebook }) => {
      const sourcePath = fileName ? path.join(ebookSourceDir, fileName) : null;
      const detectedPages = sourcePath && existsSync(sourcePath) ? countPdfPages(sourcePath) : null;
      const fileUrl = await copyPdfIfAvailable({ ...ebook, fileName });

      return prisma.ebook.upsert({
        where: { slug: ebook.slug },
        update: {
          ...ebook,
          pages: detectedPages ?? ebook.pages,
          fileUrl
        },
        create: {
          ...ebook,
          pages: detectedPages ?? ebook.pages,
          fileUrl
        }
      });
    })
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

  await prisma.adminUser.upsert({
    where: { email: "admin@bookbridge.test" },
    update: {
      name: "Library Admin",
      role: "SUPER_ADMIN",
      passwordHash: hashPassword(process.env.ADMIN_SEED_PASSWORD || "admin123")
    },
    create: {
      name: "Library Admin",
      email: "admin@bookbridge.test",
      role: "SUPER_ADMIN",
      passwordHash: hashPassword(process.env.ADMIN_SEED_PASSWORD || "admin123")
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
