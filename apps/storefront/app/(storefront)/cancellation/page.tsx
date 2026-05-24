import { PolicyPageView } from "@/components/content/PolicyPageView";
import { getPolicy } from "@/lib/get-policies";

export async function generateMetadata() {
  const policy = await getPolicy("cancellation");
  return { title: policy.title };
}

export default async function RaysCancellationPage() {
  const policy = await getPolicy("cancellation");
  return <PolicyPageView variant="rays" policy={policy} />;
}
