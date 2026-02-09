import { useCallback, useEffect, useRef, useState } from "react";
import type { AnnotationClass } from "@/types/models";
import { Input } from "@/components/ui/input";

interface ClassSelectionPopupProps {
  position: { x: number; y: number };
  classes: AnnotationClass[];
  onSelect: (cls: AnnotationClass) => void;
  onClose: () => void;
}

export function ClassSelectionPopup({
  position,
  classes,
  onSelect,
  onClose,
}: ClassSelectionPopupProps) {
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const filtered = classes.filter(
    (cls) =>
      cls.displayLabel.toLowerCase().includes(search.toLowerCase()) ||
      cls.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Scroll active item into view on keyboard navigation
  useEffect(() => {
    const el = itemRefs.current.get(activeIndex);
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[activeIndex]) {
          onSelect(filtered[activeIndex]);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [filtered, activeIndex, onSelect, onClose],
  );

  // Clamp position to viewport
  const popupWidth = 256;
  const popupMaxHeight = 340;
  const style: React.CSSProperties = {
    position: "fixed",
    left: Math.min(position.x, window.innerWidth - popupWidth - 16),
    top: Math.min(position.y, window.innerHeight - popupMaxHeight - 16),
    zIndex: 50,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* Popup */}
      <div
        ref={containerRef}
        style={style}
        className="w-64 rounded-lg border bg-popover text-popover-foreground shadow-lg ring-1 ring-border/50"
        onKeyDown={handleKeyDown}
      >
        <div className="p-2 border-b">
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search classes..."
            className="h-8 text-sm"
            aria-label="Search annotation classes"
          />
        </div>
        <div className="max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              No classes found
            </div>
          ) : (
            <div className="p-1" role="listbox">
              {filtered.map((cls, idx) => (
                <button
                  key={cls.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(idx, el);
                    else itemRefs.current.delete(idx);
                  }}
                  role="option"
                  aria-selected={idx === activeIndex}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left transition-colors hover:bg-accent ${idx === activeIndex ? "bg-accent" : ""}`}
                  onClick={() => onSelect(cls)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div
                    className="h-3.5 w-3.5 rounded-sm shrink-0 border border-border/50"
                    style={{ backgroundColor: cls.color }}
                  />
                  <span className="truncate">{cls.displayLabel}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
