import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_ALL_PAGE_BLOCKS,
  CREATE_PAGE_BLOCK,
  UPDATE_PAGE_BLOCK,
  ACTIVATE_PAGE_BLOCK,
  DEACTIVATE_PAGE_BLOCK,
  REORDER_PAGE_BLOCKS,
} from "../graphql/marketingApi";
import type { PageBlock } from "../types/marketing.types";
import type { PageBlockFormValues } from "../schemas/marketing.schemas";
import { PageBlockForm } from "./PageBlockForm";

function Drawer({ open, title, onClose, children }: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div className={[
        "fixed top-0 end-0 h-full w-full max-w-lg bg-surface border-s border-border z-50",
        "transition-transform duration-300 overflow-y-auto",
        open ? "translate-x-0" : "translate-x-full",
      ].join(" ")} dir="rtl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-text">{title}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </>
  );
}

const TYPE_COLORS: Record<string, string> = {
  Hero: "bg-accent/20 text-accent",
  VehicleStrip: "bg-blue-500/20 text-blue-400",
  CategoryGrid: "bg-green-500/20 text-green-400",
  ProductList: "bg-purple-500/20 text-purple-400",
  BannerSingle: "bg-yellow-500/20 text-yellow-400",
  BannerDouble: "bg-orange-500/20 text-orange-400",
};

export function PageBlocksPanel() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<PageBlock | null>(null);

  const { data, loading, refetch } = useQuery<{ pageBlocks: PageBlock[] }>(GET_ALL_PAGE_BLOCKS, {
    variables: {},
  });

  const [createBlock, { loading: creating }] = useMutation(CREATE_PAGE_BLOCK);
  const [updateBlock, { loading: updating }] = useMutation(UPDATE_PAGE_BLOCK);
  const [activateBlock] = useMutation(ACTIVATE_PAGE_BLOCK);
  const [deactivateBlock] = useMutation(DEACTIVATE_PAGE_BLOCK);
  const [reorderBlocks] = useMutation(REORDER_PAGE_BLOCKS);

  const blocks = data?.pageBlocks ?? [];

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (b: PageBlock) => { setEditing(b); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditing(null); };

  const buildTranslations = (vals: PageBlockFormValues) => [
    { locale: "ar", title: vals.arTitle || null, subtitle: vals.arSubtitle || null, ctaText: vals.arCtaText || null },
    { locale: "en", title: vals.enTitle || null, subtitle: vals.enSubtitle || null, ctaText: vals.enCtaText || null },
  ].filter((t) => t.title || t.subtitle || t.ctaText);

  const handleSubmit = async (vals: PageBlockFormValues) => {
    const translations = buildTranslations(vals);
    if (editing) {
      await updateBlock({
        variables: {
          input: {
            id: editing.id,
            config: vals.config,
            bindingType: vals.bindingType,
            targetId: vals.targetId || null,
            targetUrl: vals.targetUrl || null,
            activeFrom: vals.activeFrom || null,
            activeTo: vals.activeTo || null,
            translations,
          },
        },
      });
    } else {
      await createBlock({
        variables: {
          input: {
            type: vals.type,
            sortOrder: vals.sortOrder,
            config: vals.config,
            bindingType: vals.bindingType,
            targetId: vals.targetId || null,
            targetUrl: vals.targetUrl || null,
            activeFrom: vals.activeFrom || null,
            activeTo: vals.activeTo || null,
            translations,
          },
        },
      });
    }
    await refetch();
    closeDrawer();
  };

  const toggleActive = async (block: PageBlock) => {
    if (block.isActive) {
      await deactivateBlock({ variables: { id: block.id } });
    } else {
      await activateBlock({ variables: { id: block.id } });
    }
    await refetch();
  };

  const moveBlock = async (idx: number, dir: -1 | 1) => {
    const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const current = sorted[idx];
    const target = sorted[targetIdx];
    if (!current || !target) return;
    const swapped = [
      { id: current.id, sortOrder: target.sortOrder },
      { id: target.id, sortOrder: current.sortOrder },
    ];
    await reorderBlocks({ variables: { input: swapped } });
    await refetch();
  };

  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text">بلوكات الصفحة</h3>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 bg-accent text-accent-fg text-sm font-medium rounded hover:bg-accent-hover transition-colors"
        >
          + إضافة بلوك
        </button>
      </div>

      {loading && <p className="text-text-muted text-sm">جاري التحميل...</p>}

      {!loading && sorted.length === 0 && (
        <p className="text-text-muted text-sm text-center py-8">لا توجد بلوكات حالياً</p>
      )}

      <div className="space-y-2">
        {sorted.map((block, idx) => (
          <div
            key={block.id}
            className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border"
          >
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveBlock(idx, -1)}
                disabled={idx === 0}
                className="text-text-muted hover:text-text text-xs disabled:opacity-20 px-1"
                aria-label="تحريك لأعلى"
              >▲</button>
              <button
                onClick={() => moveBlock(idx, 1)}
                disabled={idx === sorted.length - 1}
                className="text-text-muted hover:text-text text-xs disabled:opacity-20 px-1"
                aria-label="تحريك لأسفل"
              >▼</button>
            </div>

            <span className="text-text-muted text-xs w-6 text-center">{block.sortOrder}</span>

            <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[block.type] ?? "bg-surface-alt text-text-muted"}`}>
              {block.type}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-muted truncate">
                {block.activeFrom || block.activeTo
                  ? `${block.activeFrom?.slice(0, 10) ?? "—"} → ${block.activeTo?.slice(0, 10) ?? "—"}`
                  : "دائماً"}
              </p>
            </div>

            {/* Active toggle */}
            <button
              onClick={() => toggleActive(block)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                block.isActive
                  ? "bg-success/20 text-success hover:bg-success/30"
                  : "bg-surface-alt text-text-muted hover:bg-border"
              }`}
            >
              {block.isActive ? "مفعّل" : "معطّل"}
            </button>

            <button
              onClick={() => openEdit(block)}
              className="text-xs text-accent hover:underline"
            >
              تعديل
            </button>
          </div>
        ))}
      </div>

      <Drawer
        open={drawerOpen}
        title={editing ? "تعديل بلوك" : "إضافة بلوك جديد"}
        onClose={closeDrawer}
      >
        <PageBlockForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          loading={creating || updating}
        />
      </Drawer>
    </div>
  );
}
