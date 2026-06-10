import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { Parent } from "../types";
import { getCurrentParent, getUnreadCount } from "../services/api";

interface ParentContextType {
  parent: Parent | null;
  loading: boolean;
  refreshParent: () => Promise<void>;
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
}

const ParentContext = createContext<ParentContextType | undefined>(undefined);

export const ParentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [parent, setParent] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshParent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCurrentParent();
      if (res.data.success) {
        setParent(res.data.data);
        setUnreadCount(res.data.data.unreadNotificationCount);
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      if (res.data.success) {
        setUnreadCount(res.data.data.count);
      }
    } catch (error) {
      console.error("获取未读数量失败:", error);
    }
  }, []);

  useEffect(() => {
    refreshParent();

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshParent, refreshUnreadCount]);

  return (
    <ParentContext.Provider
      value={{
        parent,
        loading,
        refreshParent,
        unreadCount,
        refreshUnreadCount,
      }}
    >
      {children}
    </ParentContext.Provider>
  );
};

export const useParent = () => {
  const context = useContext(ParentContext);
  if (context === undefined) {
    throw new Error("useParent must be used within a ParentProvider");
  }
  return context;
};
