import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About | BookBridge",
  description: "Meet the BookBridge team and learn about our mission, vision, and goals."
};

const leadership = {
  name: "Jesus Lorenzo Agda",
  role: "Chief Executive Officer",
  image: "/team/jesus-lorenzo-agda.jpg",
  summary:
    "Leads BookBridge with a focus on accessible learning, thoughtful digital tools, and a library experience built for students."
};

const producers = [
  {
    name: "Jandy Dela Pena Guintadcan",
    role: "Chief Operating Officer / Producer",
    image: "/team/jandy-dela-pena-guintadcan.jpg"
  },
  {
    name: "Johnnark Gerez",
    role: "Producer",
    image: "/team/johnnark-gerez.jpg"
  },
  {
    name: "Jericho Amante",
    role: "Producer",
    image: "/team/jericho-amante.jpg"
  },
  {
    name: "Charles Keil Yobia",
    role: "Producer",
    image: "/team/charles-keil-yobia.jpg"
  },
  {
    name: "Kevin R. Gonzales",
    role: "Producer",
    image: "/team/kevin-r-gonzales.jpg"
  }
];

const principles = [
  {
    title: "Mission",
    text: "To make digital reading simple, organized, and reachable for learners who need reliable access to helpful books and academic resources."
  },
  {
    title: "Vision",
    text: "To become a trusted bridge between students and knowledge, where every reader can discover materials that support growth and confidence."
  },
  {
    title: "Goal",
    text: "To keep improving BookBridge through a stronger catalog, smoother access, and a reading experience that supports everyday learning."
  }
];

const commitments = [
  "Build a focused digital library for students and curious readers.",
  "Make ebooks easier to browse, open, and understand.",
  "Support learning through clean design and dependable access.",
  "Keep improving the platform with feedback from real users."
];

export default function AboutPage() {
  return (
    <main className="bg-white">

      {/* ── Hero ── */}
      <section className="border-b bg-paper">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-palm">About BookBridge</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-foreground sm:text-5xl">
            Built by students, for students.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted-foreground">
            BookBridge is a digital library project made to help readers find useful ebooks,
            explore topics with ease, and keep learning without unnecessary barriers.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/#catalog">
              <Button size="lg" className="gap-2">
                <BookOpen size={16} />
                Browse Library
              </Button>
            </Link>
            <Link href="/subscribe">
              <Button size="lg" variant="outline" className="gap-2">
                View Plans
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Goal ── */}
      <section className="border-b py-16">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-8 text-xs font-bold uppercase tracking-widest text-palm">Our Principles</p>
          <div className="grid gap-8 md:grid-cols-3">
            {principles.map((item) => (
              <div key={item.title}>
                <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="border-b py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-palm">The Team</p>
              <h2 className="mt-1 text-3xl font-extrabold text-foreground">Meet the people</h2>
            </div>
            <span className="text-sm text-muted-foreground">6 members</span>
          </div>

          {/* All members — CEO first, same card style */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {[leadership, ...producers].map((member) => (
              <div
                key={member.name}
                className="overflow-hidden rounded-xl border bg-paper"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="border-t p-4">
                  <p className="text-sm font-semibold text-foreground">{member.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What We Stand For ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-palm">Our Commitment</p>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground">
                A library experience with people behind it.
              </h2>
              <p className="mt-4 text-sm leading-8 text-muted-foreground">
                The BookBridge team believes that useful books should feel close, organized, and
                ready when students need them. Every part of the project is shaped around helping
                readers move from searching to learning faster.
              </p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {commitments.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-primary" size={17} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

    </main>
  );
}
