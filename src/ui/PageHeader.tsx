import { motion } from "motion/react";

export function PageHeader({ title, lede }: { title: string; lede: string }) {
  return (
    <motion.header
      key={title}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="max-w-[62ch]"
    >
      <h1 className="font-serif text-[clamp(1.9rem,3.2vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.01em] text-ink">
        {title}
      </h1>
      <p className="mt-2 text-[1.0625rem] leading-relaxed text-ink-muted">{lede}</p>
    </motion.header>
  );
}
