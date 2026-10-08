import { Link } from "react-router";
import { PageContainer } from "../ui/PageContainer";
import { PageHeader } from "../ui/PageHeader";

export function NotFound() {
  return (
    <PageContainer>
      <PageHeader title="No station here" lede="This address doesn't match any page of the dashboard." />
      <Link to="/" className="font-semibold text-accent underline underline-offset-4">
        Go to the flow map
      </Link>
    </PageContainer>
  );
}
