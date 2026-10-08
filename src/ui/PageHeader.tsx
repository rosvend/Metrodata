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
      <h1 className="text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.05] font-bold tracking-[-0.025em] text-ink">{title}</h1>
      <p className="mt-3 text-[1.125rem] leading-relaxed font-light text-ink">{lede}</p>
    </motion.header>
  );
}
