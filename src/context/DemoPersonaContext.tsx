"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type DemoPersona = "visitor" | "buyer" | "seller" | "admin";

type PersonaValue = {
  persona: DemoPersona;
  setPersona: (p: DemoPersona) => void;
  label: string;
};

const labels: Record<DemoPersona, string> = {
  visitor: "Visitor",
  buyer: "Buyer (Chioma)",
  seller: "Seller (Ada Fashion)",
  admin: "Admin",
};

const DemoPersonaContext = createContext<PersonaValue | null>(null);

const KEY = "nanzy-demo-persona";

export function DemoPersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<DemoPersona>("visitor");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as DemoPersona | null;
      if (saved && labels[saved]) setPersonaState(saved);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setPersona = (p: DemoPersona) => {
    setPersonaState(p);
    try {
      localStorage.setItem(KEY, p);
    } catch {
      /* ignore */
    }
  };

  if (!ready) {
    return (
      <DemoPersonaContext.Provider
        value={{ persona: "visitor", setPersona, label: labels.visitor }}
      >
        {children}
      </DemoPersonaContext.Provider>
    );
  }

  return (
    <DemoPersonaContext.Provider
      value={{ persona, setPersona, label: labels[persona] }}
    >
      {children}
    </DemoPersonaContext.Provider>
  );
}

export function useDemoPersona() {
  const ctx = useContext(DemoPersonaContext);
  if (!ctx) {
    throw new Error("useDemoPersona must be used within DemoPersonaProvider");
  }
  return ctx;
}
