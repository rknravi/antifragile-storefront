import Script from "next/script";

function isValidGa4MeasurementId(raw: string): boolean {
  return /^G-[A-Za-z0-9_-]+$/.test(raw.trim());
}

export function Ga4() {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim();
  if (!id || !isValidGa4MeasurementId(id)) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} strategy="afterInteractive" />
      <Script id="ga4-af" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(id)});`}
      </Script>
    </>
  );
}
