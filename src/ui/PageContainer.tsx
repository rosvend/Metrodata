export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-8 sm:px-8 sm:py-10">{children}</div>;
}
