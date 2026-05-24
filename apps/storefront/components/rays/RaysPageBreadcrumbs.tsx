import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { raysPath } from "@/lib/theme-paths";

type Props = {
  /** Trail after Home — last item is current page (no href). */
  trail: Crumb[];
  className?: string;
};

/** Consistent top breadcrumbs on Rays content pages (Home → … → current). */
export function RaysPageBreadcrumbs({ trail, className = "" }: Props) {
  return (
    <div className={`mx-auto max-w-6xl px-4 pt-6 md:px-8 ${className}`}>
      <Breadcrumbs variant="rays" items={[{ label: "Home", href: raysPath("/") }, ...trail]} />
    </div>
  );
}
