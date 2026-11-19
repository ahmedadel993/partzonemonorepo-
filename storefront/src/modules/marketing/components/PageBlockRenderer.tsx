import { getActivePageBlocks } from "../actions/marketingActions";
import { getCategories, getProducts, getVehicleMakes } from "@/modules/catalog/actions/catalogActions";
import type { ActivePageBlock, PageBlockType } from "../types";
import { HeroBlock } from "./HeroBlock";
import { VehicleStripBlock } from "./VehicleStripBlock";
import { CategoryGridBlock } from "./CategoryGridBlock";
import { ProductListBlock } from "./ProductListBlock";
import { BannerSingleBlock } from "./BannerSingleBlock";
import { BannerDoubleBlock } from "./BannerDoubleBlock";

interface Props {
  locale: string;
  types?: PageBlockType[];
  exclude?: PageBlockType[];
}

export async function PageBlockRenderer({ locale, types, exclude }: Props) {
  const [blocks, makes, categories, productsResult] = await Promise.all([
    getActivePageBlocks(),
    getVehicleMakes(),
    getCategories(),
    getProducts({ page: 1, pageSize: 10 }),
  ]);

  let visibleBlocks = blocks;
  if (types) {
    visibleBlocks = visibleBlocks.filter((b) => types.includes(b.type));
  } else if (exclude) {
    visibleBlocks = visibleBlocks.filter((b) => !exclude.includes(b.type));
  }

  if (visibleBlocks.length === 0) {
    if (!types && !exclude) {
      return (
        <section className="py-12 text-center">
          <p className="text-text-muted text-sm">لا توجد محتويات للصفحة الرئيسية حالياً</p>
        </section>
      );
    }
    return null;
  }

  return (
    <>
      {visibleBlocks.map((block) => (
        <BlockSwitch
          key={block.id}
          block={block}
          locale={locale}
          makes={makes}
          categories={categories}
          products={productsResult.items}
        />
      ))}
    </>
  );
}

function BlockSwitch({
  block,
  locale,
  makes,
  categories,
  products,
}: {
  block: ActivePageBlock;
  locale: string;
  makes: Awaited<ReturnType<typeof getVehicleMakes>>;
  categories: Awaited<ReturnType<typeof getCategories>>;
  products: Awaited<ReturnType<typeof getProducts>>["items"];
}) {
  switch (block.type) {
    case "Hero":
      return <HeroBlock block={block} locale={locale} />;
    case "VehicleStrip":
      return <VehicleStripBlock block={block} makes={makes} />;
    case "CategoryGrid":
      return <CategoryGridBlock block={block} categories={categories} />;
    case "ProductList":
      return <ProductListBlock block={block} products={products} />;
    case "BannerSingle":
      return <BannerSingleBlock block={block} locale={locale} />;
    case "BannerDouble":
      return <BannerDoubleBlock block={block} locale={locale} />;
    default:
      return null;
  }
}
