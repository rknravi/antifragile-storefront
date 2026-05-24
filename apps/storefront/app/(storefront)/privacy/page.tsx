import { PolicyPageView } from "@/components/content/PolicyPageView";
import { getPolicy } from "@/lib/get-policies";

export async function generateMetadata() {
  const policy = await getPolicy("privacy");
  return { title: policy.title };
}

export default async function RaysPrivacyPage() {
  const policy = await getPolicy("privacy");
  return <PolicyPageView variant="rays" policy={policy} />;
}
