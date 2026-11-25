import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_ALL_PAGE_BLOCKS,
  CREATE_PAGE_BLOCK,
  UPDATE_PAGE_BLOCK,
  ACTIVATE_PAGE_BLOCK,
  DEACTIVATE_PAGE_BLOCK,
  REORDER_PAGE_BLOCKS,
  DELETE_PAGE_BLOCK,
} from "../graphql/marketingApi";
import type { PageBlock } from "../types/marketing.types";
import type { PageBlockFormValues } from "../schemas/marketing.schemas";
import { PageBlockForm, localInputToIso } from "./PageBlockForm";
import { useLanguage } from "@/contexts/LanguageContext";

function Drawer({ open, title, onClose, children }: {
  open: boolean; title: string; onClose: () => void; children: React.ReactNode;
}) {
  const { dir } = useLanguage();
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />}
      <div className={[
        "fixed top-0 end-0 h-full w-full max-w-lg bg-surface border-s border-border z-50",
        "transition-transform duration-300 overflow-y-auto",
        open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full invisible",
      ].join(" ")} dir={dir}>
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
  const { t, dir } = useLanguage();
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
  const [deleteBlock] = useMutation(DELETE_PAGE_BLOCK);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  const blocks = data?.pageBlocks ?? [];

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (b: PageBlock) => { setEditing(b); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditing(null); setSaveError(null); };
  const [saveError, setSaveError] = useState<string | null>(null);

  const buildTranslations = (vals: PageBlockFormValues) => [
    { locale: "ar", title: vals.arTitle || null, subtitle: vals.arSubtitle || null, ctaText: vals.arCtaText || null },
    { locale: "en", title: vals.enTitle || null, subtitle: vals.enSubtitle || null, ctaText: vals.enCtaText || null },
  ].filter((t) => t.title || t.subtitle || t.ctaText);

  const handleSubmit = async (vals: PageBlockFormValues) => {
    setSaveError(null);
    try {
      const errors = await saveBlock(vals);
      if (errors?.length) { setSaveError(errors[0]!); return; }
      await refetch();
      closeDrawer();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : t("errorUnknown"));
    }
  };

  const saveBlock = async (vals: PageBlockFormValues): Promise<string[] | undefined> => {
    const translations = buildTranslations(vals);
    if (editing) {
      const res = await updateBlock({
        variables: {
          input: {
            id: editing.id,
            config: vals.config,
            bindingType: vals.bindingType,
            targetId: vals.targetId || null,
            targetUrl: vals.targetUrl || null,
            activeFrom: localInputToIso(vals.activeFrom),
            activeTo: localInputToIso(vals.activeTo),
            translations,
          },
        },
      });
      return res.data?.updatePageBlock?.errors;
    } else {
      const res = await createBlock({
        variables: {
          input: {
            type: vals.type,
            sortOrder: vals.sortOrder,
            config: vals.config,
            bindingType: vals.bindingType,
            targetId: vals.targetId || null,
            targetUrl: vals.targetUrl || null,
            activeFrom: localInputToIso(vals.activeFrom),
            activeTo: localInputToIso(vals.activeTo),
            translations,
          },
        },
      });
      return res.data?.createPageBlock?.errors;
    }
  };

  // Run a row action: one at a time per row, surface errors, then refetch.
  const runRowAction = async (id: string, action: () => Promise<{ errors?: string[] } | null | undefined>) => {
    setListError(null);
    setBusyId(id);
    try {
      const payload = await action();
      if (payload?.errors?.length) setListError(payload.errors[0]!);
      await refetch();
    } catch (e) {
      setListError(e instanceof Error ? e.message : t("errorUnknown"));
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = (block: PageBlock) =>
    runRowAction(block.id, async () => block.isActive
      ? (await deactivateBlock({ variables: { id: block.id } })).data?.deactivatePageBlock
      : (await activateBlock({ variables: { id: block.id } })).data?.activatePageBlock);

  const removeBlock = (block: PageBlock) => {
    setConfirmDeleteId(null);
    return runRowAction(block.id, async () =>
      (await deleteBlock({ variables: { id: block.id } })).data?.deletePageBlock);
  };

  // The server returns blocks in a stable order (SortOrder, then creation time);
  // Array.sort is stable, so ties keep that order across refetches.
  const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
  const nextSortOrder = sorted.length ? Math.max(...sorted.map((b) => b.sortOrder)) + 1 : 0;

  // Move a block, then renumber every block 0..n-1 so duplicate sort orders
  // (which made swapping a no-op) disappear.
  const moveBlock = async (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[idx], reordered[targetIdx]] = [reordered[targetIdx]!, reordered[idx]!];
    const input = reordered.map((b, i) => ({ id: b.id, sortOrder: i }));
    await runRowAction(sorted[idx].id, async () => {
      await reorderBlocks({ variables: { input } });
      return null;
    });
  };

  const blockTitle = (b: PageBlock) =>
    b.translations.find((tr) => tr.locale === "ar")?.title
    ?? b.translations.find((tr) => tr.locale === "en")?.title
    ?? t("blockUntitled");

  return (
    <div className="space-y-4" dir={dir}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-text">{t("blocksHeading")}</h3>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 bg-accent text-accent-fg text-sm font-medium rounded hover:bg-accent-hover transition-colors"
        >
          {t("addBlock")}
        </button>
      </div>

      {loading && <p className="text-text-muted text-sm">{t("blocksLoading")}</p>}

      {listError && (
        <p className="p-2 rounded bg-danger/10 text-danger text-xs">{listError}</p>
      )}

      {!loading && sorted.length === 0 && (
        <p className="text-text-muted text-sm text-center py-8">{t("blocksEmpty")}</p>
      )}

      <div className="space-y-2">
        {sorted.map((block, idx) => (
          <div
            key={block.id}
            data-block-id={block.id}
            className={`flex items-center gap-3 p-3 bg-surface rounded-lg border border-border ${busyId === block.id ? "opacity-60" : ""}`}
          >
            {/* Reorder buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveBlock(idx, -1)}
                disabled={idx === 0 || busyId !== null}
                className="text-text-muted hover:text-text text-xs disabled:opacity-20 px-1"
                aria-label={t("ariaReorderUp")}
              >▲</button>
              <button
                onClick={() => moveBlock(idx, 1)}
                disabled={idx === sorted.length - 1 || busyId !== null}
                className="text-text-muted hover:text-text text-xs disabled:opacity-20 px-1"
                aria-label={t("ariaReorderDown")}
              >▼</button>
            </div>

            <span className="text-text-muted text-xs w-6 text-center">{block.sortOrder}</span>

            <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_COLORS[block.type] ?? "bg-surface-alt text-text-muted"}`}>
              {block.type}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-text truncate">{blockTitle(block)}</p>
              <p className="text-xs text-text-muted truncate">
                {block.activeFrom || block.activeTo
                  ? `${block.activeFrom?.slice(0, 10) ?? "—"} → ${block.activeTo?.slice(0, 10) ?? "—"}`
                  : t("blockAlways")}
              </p>
            </div>

            {/* Active switch — shows the CURRENT state; click to flip it */}
            <button
              type="button"
              role="switch"
              aria-checked={block.isActive}
              disabled={busyId === block.id}
              onClick={() => toggleActive(block)}
              title={block.isActive ? t("blockActivate") : t("blockDeactivate")}
              className="flex items-center gap-2 text-xs disabled:opacity-50"
            >
              <span className={`relative inline-block w-9 h-5 rounded-full transition-colors ${block.isActive ? "bg-success" : "bg-border"}`}>
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${block.isActive ? "start-[1.125rem]" : "start-0.5"}`}
                />
              </span>
              <span className={block.isActive ? "text-success font-medium" : "text-text-muted"}>
                {block.isActive ? t("blockActive") : t("blockInactive")}
              </span>
            </button>

            <button
              onClick={() => openEdit(block)}
              className="text-xs text-accent hover:underline"
            >
              {t("blockActionEdit")}
            </button>

            {confirmDeleteId === block.id ? (
              <span className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => removeBlock(block)}
                  className="px-2 py-0.5 rounded bg-danger text-white font-medium hover:bg-danger/90"
                >
                  {t("confirmDeleteBlock")}
                </button>
                <button onClick={() => setConfirmDeleteId(null)} className="text-text-muted hover:text-text">
                  {t("blockActionCancel")}
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(block.id)}
                disabled={busyId === block.id}
                className="text-xs text-text-muted hover:text-danger disabled:opacity-50"
              >
                {t("blockActionDelete")}
              </button>
            )}
          </div>
        ))}
      </div>

      <Drawer
        open={drawerOpen}
        title={editing ? t("drawerEditBlock") : t("drawerNewBlock")}
        onClose={closeDrawer}
      >
        {saveError && (
          <p className="mb-4 p-2 rounded bg-danger/10 text-danger text-xs">{saveError}</p>
        )}
        <PageBlockForm
          // Remount per item so the form picks up the right defaults.
          key={drawerOpen ? (editing?.id ?? "new") : "closed"}
          initial={editing ?? undefined}
          defaultSortOrder={nextSortOrder}
          onSubmit={handleSubmit}
          loading={creating || updating}
        />
      </Drawer>
    </div>
  );
}
