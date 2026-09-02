import { Accordion } from "./accordion";
import type { ProjectFaq } from "../types/public";

interface ProjectFaqsProps {
  items: ProjectFaq[];
}

export function ProjectFaqs({ items }: ProjectFaqsProps) {
  if (items.length === 0) return null;

  const accordionItems = [...items]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((faq) => ({
      id: faq.id,
      title: faq.question,
      content: faq.answer,
    }));

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-semibold text-slate-900 md:text-xl">
        Frequently asked questions
      </h2>
      <div className="mt-3">
        <Accordion items={accordionItems} />
      </div>
    </section>
  );
}
