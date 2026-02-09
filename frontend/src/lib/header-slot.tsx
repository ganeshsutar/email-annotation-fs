import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface HeaderSlotState {
  breadcrumb: ReactNode | null;
  actions: ReactNode | null;
}

interface HeaderSlotSetters {
  setBreadcrumb: (node: ReactNode | null) => void;
  setActions: (node: ReactNode | null) => void;
}

// Split into read (state) and write (setters) contexts.
// The workspace only consumes setters (stable refs), so header slot
// state changes never cause the workspace to re-render.
const HeaderSlotStateContext = createContext<HeaderSlotState | null>(null);
const HeaderSlotSettersContext = createContext<HeaderSlotSetters | null>(null);

export function HeaderSlotProvider({ children }: { children: ReactNode }) {
  const [breadcrumb, setBreadcrumb] = useState<ReactNode | null>(null);
  const [actions, setActions] = useState<ReactNode | null>(null);

  const state = useMemo(
    () => ({ breadcrumb, actions }),
    [breadcrumb, actions],
  );

  // useState setters are stable across renders, so this value never changes
  const setters = useMemo(
    () => ({ setBreadcrumb, setActions }),
    [setBreadcrumb, setActions],
  );

  return (
    <HeaderSlotSettersContext.Provider value={setters}>
      <HeaderSlotStateContext.Provider value={state}>
        {children}
      </HeaderSlotStateContext.Provider>
    </HeaderSlotSettersContext.Provider>
  );
}

/** Read breadcrumb/actions — used by layout headers */
export function useHeaderSlot() {
  const ctx = useContext(HeaderSlotStateContext);
  if (!ctx) {
    throw new Error("useHeaderSlot must be used within a HeaderSlotProvider");
  }
  return ctx;
}

/** Write breadcrumb/actions — used by workspace components */
function useHeaderSlotSetters() {
  const ctx = useContext(HeaderSlotSettersContext);
  if (!ctx) {
    throw new Error(
      "useHeaderSlotSetters must be used within a HeaderSlotProvider",
    );
  }
  return ctx;
}

export function useSetHeaderSlot(
  breadcrumb: ReactNode | null,
  actions: ReactNode | null,
) {
  const { setBreadcrumb, setActions } = useHeaderSlotSetters();
  const breadcrumbRef = useRef(breadcrumb);
  const actionsRef = useRef(actions);

  // Keep refs in sync
  breadcrumbRef.current = breadcrumb;
  actionsRef.current = actions;

  // Push initial values on mount, clean up on unmount
  useEffect(() => {
    setBreadcrumb(breadcrumbRef.current);
    setActions(actionsRef.current);
    return () => {
      setBreadcrumb(null);
      setActions(null);
    };
  }, [setBreadcrumb, setActions]);

  // Push updates when values change — use a separate effect so the
  // cleanup above only runs on unmount, not on every value change
  useEffect(() => {
    setBreadcrumb(breadcrumb);
    setActions(actions);
  }, [breadcrumb, actions, setBreadcrumb, setActions]);
}
