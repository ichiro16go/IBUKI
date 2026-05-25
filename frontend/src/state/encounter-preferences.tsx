import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type EncounterPreferencesContextValue = {
  hiddenHobbyIds: string[];
  hideEncounter: (hobbyId: string) => void;
  isEncounterHidden: (hobbyId: string) => boolean;
};

const EncounterPreferencesContext =
  createContext<EncounterPreferencesContextValue | null>(null);

export function EncounterPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [hiddenHobbyIds, setHiddenHobbyIds] = useState<string[]>([]);

  const hideEncounter = useCallback((hobbyId: string) => {
    setHiddenHobbyIds((currentIds) =>
      currentIds.includes(hobbyId) ? currentIds : [...currentIds, hobbyId],
    );
  }, []);

  const isEncounterHidden = useCallback(
    (hobbyId: string) => hiddenHobbyIds.includes(hobbyId),
    [hiddenHobbyIds],
  );

  const value = useMemo(
    () => ({
      hiddenHobbyIds,
      hideEncounter,
      isEncounterHidden,
    }),
    [hiddenHobbyIds, hideEncounter, isEncounterHidden],
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
