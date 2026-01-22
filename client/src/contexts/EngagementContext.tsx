import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface EngagementContextType {
  selectedClientId: string | null;
  selectedEngagementId: string | null;
  setSelectedClientId: (id: string) => void;
  setSelectedEngagementId: (id: string | null) => void;
  clearEngagement: () => void;
}

const EngagementContext = createContext<EngagementContextType | undefined>(undefined);

export function EngagementProvider({ children }: { children: React.ReactNode }) {
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(() => {
    return localStorage.getItem('selectedClientId');
  });
  
  const [selectedEngagementId, setSelectedEngagementIdState] = useState<string | null>(() => {
    return localStorage.getItem('selectedEngagementId');
  });

  const prevClientIdRef = useRef<string | null>(selectedClientId);

  useEffect(() => {
    if (prevClientIdRef.current !== selectedClientId && prevClientIdRef.current !== null) {
      setSelectedEngagementIdState(null);
      localStorage.removeItem('selectedEngagementId');
    }
    prevClientIdRef.current = selectedClientId;
  }, [selectedClientId]);

  const setSelectedClientId = useCallback((id: string) => {
    setSelectedClientIdState(id);
    localStorage.setItem('selectedClientId', id);
  }, []);

  const setSelectedEngagementId = useCallback((id: string | null) => {
    setSelectedEngagementIdState(id);
    if (id) {
      localStorage.setItem('selectedEngagementId', id);
    } else {
      localStorage.removeItem('selectedEngagementId');
    }
  }, []);

  const clearEngagement = useCallback(() => {
    setSelectedEngagementIdState(null);
    localStorage.removeItem('selectedEngagementId');
  }, []);

  return (
    <EngagementContext.Provider value={{
      selectedClientId,
      selectedEngagementId,
      setSelectedClientId,
      setSelectedEngagementId,
      clearEngagement,
    }}>
      {children}
    </EngagementContext.Provider>
  );
}

export function useEngagement() {
  const context = useContext(EngagementContext);
  if (context === undefined) {
    throw new Error('useEngagement must be used within an EngagementProvider');
  }
  return context;
}
