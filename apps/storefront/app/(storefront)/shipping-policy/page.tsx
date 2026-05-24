import { PolicyPageView } from "@/components/content/PolicyPageView";
import { getPolicy } from "@/lib/get-policies";

export async function generateMetadata() {
  const policy = await getPolicy("shipping");
  return { title: policy.title };
}

export default async function RaysShippingPolicyPage() {
  const policy = await getPolicy("shipping");
  return <PolicyPageView variant="rays" policy={policy} />;
}
