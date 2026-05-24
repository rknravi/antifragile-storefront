import { PolicyPageView } from "@/components/content/PolicyPageView";
import { getPolicy } from "@/lib/get-policies";

export async function generateMetadata() {
  const policy = await getPolicy("returns");
  return { title: policy.title };
}

export default async function RaysReturnsPage() {
  const policy = await getPolicy("returns");
  return <PolicyPageView variant="rays" policy={policy} />;
}
