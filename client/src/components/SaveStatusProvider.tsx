import React, { createContext, useContext, useState, useCallback } from 'react';

interface SaveStatusContextType {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  setSaving: (saving: boolean) => void;
  setLastSaved: (date: Date) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
}

const SaveStatusContext = createContext<SaveStatusContextType | null>(null);

export const SaveStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const setSaving = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);

  const setLastSavedCallback = useCallback((date: Date) => {
    setLastSaved(date);
  }, []);

  const setUnsavedChanges = useCallback((hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  }, []);

  return (
    <SaveStatusContext.Provider
      value={{
        isSaving,
        lastSaved,
        hasUnsavedChanges,
        setSaving,
        setLastSaved: setLastSavedCallback,
        setUnsavedChanges,
      }}
    >
      {children}
    </SaveStatusContext.Provider>
  );
};

export const useSaveStatus = () => {
  const context = useContext(SaveStatusContext);
  if (!context) {
    throw new Error('useSaveStatus must be used within a SaveStatusProvider');
  }
  return context;
};