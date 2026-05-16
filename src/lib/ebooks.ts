export type Ebook = {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  pages: number;
  publishedYear: number;
  isPremium: boolean;
  accent: "palm" | "coral" | "sun" | "ink";
};

export const ebooks: Ebook[] = [
  {
    id: "creative-problem-solving",
    title: "Creative Problem Solving",
    author: "Nina Santos",
    category: "Entrepreneurship",
    description:
      "A practical guide to finding everyday problems and turning them into small venture ideas.",
    pages: 84,
    publishedYear: 2026,
    isPremium: false,
    accent: "palm"
  },
  {
    id: "student-startup-basics",
    title: "Student Startup Basics",
    author: "Miguel Cruz",
    category: "Business",
    description:
      "Simple frameworks for validating ideas, interviewing users, and planning a beginner-friendly business.",
    pages: 112,
    publishedYear: 2025,
    isPremium: true,
    accent: "coral"
  },
  {
    id: "digital-study-systems",
    title: "Digital Study Systems",
    author: "Leah Ramos",
    category: "Productivity",
    description:
      "Build better study habits using simple digital tools, notes, reminders, and weekly reviews.",
    pages: 76,
    publishedYear: 2024,
    isPremium: false,
    accent: "sun"
  },
  {
    id: "community-research-fieldbook",
    title: "Community Research Fieldbook",
    author: "Rafa Dizon",
    category: "Research",
    description:
      "Question prompts and observation templates for discovering real-life community problems.",
    pages: 95,
    publishedYear: 2026,
    isPremium: true,
    accent: "ink"
  },
  {
    id: "budgeting-for-teens",
    title: "Budgeting for Teens",
    author: "Amara Lim",
    category: "Finance",
    description:
      "A friendly introduction to saving, planning expenses, and making small money decisions responsibly.",
    pages: 68,
    publishedYear: 2025,
    isPremium: false,
    accent: "coral"
  },
  {
    id: "pitch-deck-playbook",
    title: "Pitch Deck Playbook",
    author: "Paolo Mercado",
    category: "Entrepreneurship",
    description:
      "A short guide for presenting problems, solutions, target users, and project feasibility.",
    pages: 89,
    publishedYear: 2026,
    isPremium: true,
    accent: "palm"
  }
];

export const categories = ["All", ...Array.from(new Set(ebooks.map((ebook) => ebook.category)))];

export function getEbookById(id: string) {
  return ebooks.find((ebook) => ebook.id === id);
}
