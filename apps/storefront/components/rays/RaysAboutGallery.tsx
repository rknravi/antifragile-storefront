import Image from "next/image";
import { brandMarketing } from "@/lib/brand-images";

const tiles = [
  { src: brandMarketing.about1, className: "md:col-span-1 md:row-span-1" },
  { src: brandMarketing.about2, className: "md:col-span-1 md:row-span-2" },
  { src: brandMarketing.about3, className: "md:col-span-1 md:row-span-2" },
  { src: brandMarketing.about4, className: "md:col-span-1 md:row-span-1" },
  { src: brandMarketing.about5, className: "md:col-span-1 md:row-span-1" },
  { src: brandMarketing.about6, className: "md:col-span-1 md:row-span-1" },
];

export function RaysAboutGallery() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-20 md:px-8">
      <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:auto-rows-[220px] md:grid-cols-3 md:gap-6">
        {tiles.map((t, i) => (
          <div key={i} className={`relative overflow-hidden rounded-3xl ${t.className}`}>
            <Image src={t.src} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 33vw" />
          </div>
        ))}
      </div>
    </div>
  );
}
