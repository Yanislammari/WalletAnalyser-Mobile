import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";
import type { Portfolio } from "../models/Portfolio";
import PortfolioService from "../services/PortfolioService";
import { toast } from "sonner-native";
import { useAuth } from "./AuthProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

type PortfolioContextType = {
  selectedPortfolio: Portfolio | null;
  setSelectedPortfolio: (portfolio: Portfolio) => void;
  portfolios: Portfolio[];
  refresh: () => void;
};

const PortfolioContext = createContext<PortfolioContextType | null>(null);
const SELECTED_PORTFOLIO_KEY = "selectedPortfolioId";

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const portfolioService = PortfolioService.getInstance();
  const { user } = useAuth();
  const [trigger, setTrigger] = useState(0);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  const refresh = useCallback(() => setTrigger((t) => t + 1), []);

  useEffect(() => {
    const fetch = async () => {
      try {
        if (!user) return;
        const [result, savedId] = await Promise.all([
          portfolioService.getAllPortfoliosByUserId(user.id),
          AsyncStorage.getItem(SELECTED_PORTFOLIO_KEY),
        ]);

        setPortfolios(result);
        setSelectedPortfolio((prev) => {
          if (savedId) {
            const saved = result.find((p) => p.id === savedId);
            if (saved) return saved;
            if (!saved && result.length === 0) return null;
          }
          if (prev) {
            const still = result.find((p) => p.id === prev.id);
            if (still) return still;
            if (!still) return result[0] ?? null;
          }
          return result[0]
        })
      } catch {
        toast.error("Can't load portfolios");
      }
    };
    fetch();
  }, [user, trigger]);

  const handleSetSelectedPortfolio = useCallback(async (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    try {
      await AsyncStorage.setItem(SELECTED_PORTFOLIO_KEY, portfolio.id);
    } catch {

    }
  }, []);
  
  return (
    <PortfolioContext.Provider value={{
      selectedPortfolio,
      setSelectedPortfolio: handleSetSelectedPortfolio,
      portfolios,
      refresh,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used inside PortfolioProvider");
  return ctx;
}