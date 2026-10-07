import Link from "next/link";
import { RiAddLine } from "react-icons/ri";

// Answer blocks:
//   "text"                          -> paragraph
//   ["text ", { label, href }, "."] -> paragraph with inline links
//   { list: ["a", "b"] }            -> bullet list
//   { links: [{ label, href }] }    -> "→ label" call-to-action links
const isLink = (part) => part && typeof part === "object" && part.href;

const blockToText = (block) => {
  if (typeof block === "string") return block;
  if (Array.isArray(block)) {
    return block.map((part) => (isLink(part) ? part.label : part)).join("");
  }
  if (block?.list) return block.list.join(", ");
  return "";
};

const buildFaqJsonLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer.map(blockToText).filter(Boolean).join(" "),
    },
  })),
});

const renderBlock = (block, index) => {
  if (typeof block === "string") {
    return <p key={index}>{block}</p>;
  }

  if (Array.isArray(block)) {
    return (
      <p key={index}>
        {block.map((part, partIndex) =>
          isLink(part) ? (
            <Link
              key={partIndex}
              href={part.href}
              className="font-semibold text-accent underline-offset-4 hover:underline"
            >
              {part.label}
            </Link>
          ) : (
            part
          ),
        )}
      </p>
    );
  }

  if (block?.list) {
    return (
      <ul key={index} className="list-disc space-y-1 pl-5">
        {block.list.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
    );
  }

  if (block?.links) {
    return (
      <div key={index} className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
        {block.links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            → {link.label}
          </Link>
        ))}
      </div>
    );
  }

  return null;
};

export default function FaqSection({ id = "faq", title, items = [] }) {
  if (!items.length) return null;

  return (
    <section id={id} className="relative w-full border-t border-white/5 py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd(items)).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto px-4 sm:px-8 lg:px-20">
        <h2 className="mb-8 flex items-center gap-3 text-2xl font-semibold uppercase tracking-wide text-white md:text-3xl font-display">
          <span className="block h-8 w-1 rounded-full bg-accent" />
          {title}
        </h2>

        <div className="max-w-4xl space-y-3">
          {items.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition open:border-accent/30 open:bg-white/[0.07]"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-white sm:text-lg [&::-webkit-details-marker]:hidden">
                <h3 className="font-semibold">{item.question}</h3>
                <RiAddLine className="mt-1 h-5 w-5 shrink-0 text-accent transition group-open:rotate-45" />
              </summary>
              <div className="space-y-3 px-5 pb-5 text-sm leading-7 text-white/70 sm:text-base font-body">
                {item.answer.map(renderBlock)}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
