import { Link } from "react-router";
import { useT } from "../i18n/lang";
import { PageContainer } from "../ui/PageContainer";
import { PageHeader } from "../ui/PageHeader";

export function NotFound() {
  const t = useT();
  return (
    <PageContainer>
      <PageHeader title={t.notFound.title} lede={t.notFound.lede} />
      <Link to="/" className="font-semibold text-accent underline underline-offset-4">
        {t.notFound.link}
      </Link>
    </PageContainer>
  );
}
