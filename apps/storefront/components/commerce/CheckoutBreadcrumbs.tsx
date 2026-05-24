import Link from "next/link";

type Step = "information" | "review";

type Props = {
  step: Step;
  cartHref: string;
  /** Go back to contact/shipping when on the payment step */
  onInformationClick?: () => void;
  className?: string;
};

const linkClass = "text-neutral-500 hover:text-neutral-900 hover:underline";

export function CheckoutBreadcrumbs({
  step,
  cartHref,
  onInformationClick,
  className = "",
}: Props) {
  const informationCurrent = step === "information";
  const paymentCurrent = step === "review";
  const informationClickable = paymentCurrent && Boolean(onInformationClick);

  return (
    <nav aria-label="Checkout progress" className={`text-sm ${className}`}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li className="flex items-center gap-1.5">
          <Link href={cartHref} className={linkClass}>
            Cart
          </Link>
        </li>

        <li className="flex items-center gap-1.5">
          <span className="text-neutral-400" aria-hidden>
            /
          </span>
          {informationClickable ? (
            <button
              type="button"
              onClick={onInformationClick}
              className={linkClass}
            >
              Information
            </button>
          ) : (
            <span
              className={informationCurrent ? "font-semibold text-neutral-900" : "text-neutral-500"}
              aria-current={informationCurrent ? "step" : undefined}
            >
              Information
            </span>
          )}
        </li>

        <li className="flex items-center gap-1.5">
          <span className="text-neutral-400" aria-hidden>
            /
          </span>
          <span
            className={paymentCurrent ? "font-semibold text-neutral-900" : "text-neutral-500"}
            aria-current={paymentCurrent ? "step" : undefined}
          >
            Payment
          </span>
        </li>
      </ol>
    </nav>
  );
}
