import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRegionByCode, getLinksForRegion, getRegions } from "@/lib/data";
import { CATEGORY_META } from "@/lib/constants";
import { RegionPage } from "@/components/region-page";

export const dynamic = "force-static";
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: { slug: string; category: string };
}): Promise<Metadata> {
  const { slug, category } = params;
  const r = await getRegionByCode(slug);
  const meta = CATEGORY_META[category];
  if (!r || !meta) return {};
  return { title: `${meta.label} — ${r.flag} ${r.name}`, description: meta.blurb };
}

export default async function RegionCategoryRoute({
  params,
}: {
  params: { slug: string; category: string };
}) {
  const { slug, category } = params;
  const region = await getRegionByCode(slug);
  if (!region) notFound();
  if (!CATEGORY_META[category]) notFound();
  const data = await getLinksForRegion(region.code);
  if (!data.categories.find((c) => c.id === category)) notFound();
  return <RegionPage region={region} onlyCategoryId={category} />;
}

export async function generateStaticParams() {
  const regions = await getRegions();
  const cats = Object.keys(CATEGORY_META);
  return regions.flatMap((r) =>
    cats.map((category) => ({ slug: r.code.toLowerCase(), category })),
  );
}
