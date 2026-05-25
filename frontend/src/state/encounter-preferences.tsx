import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type EncounterPreferencesContextValue = {
  hiddenEncounterIds: string[];
  hideEncounter: (encounterId: string) => void;
  isEncounterHidden: (encounterId: string) => boolean;
};

const EncounterPreferencesContext =
  createContext<EncounterPreferencesContextValue | null>(null);

export function EncounterPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [hiddenEncounterIds, setHiddenEncounterIds] = useState<string[]>([]);

  const hideEncounter = useCallback((encounterId: string) => {
    setHiddenEncounterIds((currentIds) =>
      currentIds.includes(encounterId)
        ? currentIds
        : [...currentIds, encounterId],
    );
  }, []);

  const isEncounterHidden = useCallback(
    (encounterId: string) => hiddenEncounterIds.includes(encounterId),
    [hiddenEncounterIds],
  );

  const value = useMemo(
    () => ({
      hiddenEncounterIds,
      hideEncounter,
      isEncounterHidden,
    }),
    [hiddenEncounterIds, hideEncounter, isEncounterHidden],
  );

  return (
    <EncounterPreferencesContext.Provider value={value}>
      {children}
    </EncounterPreferencesContext.Provider>
  );
}

export function useEncounterPreferences() {
  const context = useContext(EncounterPreferencesContext);

  if (!context) {
    throw new Error(
      "useEncounterPreferences must be used within EncounterPreferencesProvider",
    );
  }

  return context;
}
