import { motion } from "motion/react";

interface Props {
  title: string;
  lede: string;
  compact?: boolean;
}

export function PageHeader({ title, lede, compact = false }: Props) {
  return (
    <motion.header
      key={title}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="max-w-[62ch]"
    >
      <h1
        className={`leading-[1.05] font-bold tracking-[-0.025em] text-ink ${
          compact ? "text-[clamp(1.6rem,2.4vw,2rem)]" : "text-[clamp(2rem,3.4vw,2.9rem)]"
        }`}
      >
        {title}
      </h1>
      <p className={`leading-relaxed font-light text-ink ${compact ? "mt-1.5 text-[15px]" : "mt-3 text-[1.125rem]"}`}>
        {lede}
      </p>
    </motion.header>
  );
}
