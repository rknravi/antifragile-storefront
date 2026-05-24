import { PolicyPageView } from "@/components/content/PolicyPageView";
import { getPolicy } from "@/lib/get-policies";

export async function generateMetadata() {
  const policy = await getPolicy("terms");
  return { title: policy.title };
}

export default async function RaysTermsPage() {
  const policy = await getPolicy("terms");
  return <PolicyPageView variant="rays" policy={policy} />;
}
