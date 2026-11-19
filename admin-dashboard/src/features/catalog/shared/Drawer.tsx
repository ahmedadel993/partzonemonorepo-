export function Drawer({
  open,
  title,
  onClose,
  children,
  asideClassName = "w-96",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  asideClassName?: string;
}) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <aside
        className={[
          "fixed top-0 end-0 h-full bg-surface border-s border-border z-50",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full",
          asideClassName,
        ].join(" ")}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <h2 className="font-semibold text-text">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto h-[calc(100%-4rem)]">{children}</div>
      </aside>
    </>
  );
}
