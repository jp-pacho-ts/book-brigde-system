"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

type SubscriptionStatus = "free" | "active";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt?: string;
};

type DemoUserWithPassword = DemoUser & {
  password: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  isReady: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  activateSubscription: () => void;
  cancelSubscription: () => void;
  isSubscribed: boolean;
};

const STORAGE_KEY = "bookbridge_demo_user";

const demoUsers: DemoUserWithPassword[] = [
  {
    id: "user_student",
    name: "Student Reader",
    email: "student@bookbridge.test",
    password: "student123",
    subscriptionStatus: "free"
  },
  {
    id: "user_premium",
    name: "Premium Reader",
    email: "premium@bookbridge.test",
    password: "premium123",
    subscriptionStatus: "active",
    subscriptionEndsAt: "2026-12-31"
  }
];

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function stripPassword(user: DemoUserWithPassword): DemoUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionEndsAt: user.subscriptionEndsAt
  };
}

function getOneMonthFromNow() {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth.toISOString().slice(0, 10);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedUser = window.localStorage.getItem(STORAGE_KEY);

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as DemoUser);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setIsReady(true);
  }, []);

  const saveUser = useCallback((nextUser: DemoUser | null) => {
    setUser(nextUser);

    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = useCallback(
    (email: string, password: string) => {
      const matchedUser = demoUsers.find(
        (demoUser) =>
          demoUser.email.toLowerCase() === email.trim().toLowerCase() &&
          demoUser.password === password
      );

      if (!matchedUser) {
        return false;
      }

      saveUser(stripPassword(matchedUser));
      return true;
    },
    [saveUser]
  );

  const logout = useCallback(() => {
    saveUser(null);
  }, [saveUser]);

  const activateSubscription = useCallback(() => {
    const currentUser =
      user ??
      stripPassword({
        ...demoUsers[0],
        subscriptionStatus: "free"
      });

    saveUser({
      ...currentUser,
      subscriptionStatus: "active",
      subscriptionEndsAt: getOneMonthFromNow()
    });
  }, [saveUser, user]);

  const cancelSubscription = useCallback(() => {
    if (!user) {
      return;
    }

    saveUser({
      ...user,
      subscriptionStatus: "free",
      subscriptionEndsAt: undefined
    });
  }, [saveUser, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      login,
      logout,
      activateSubscription,
      cancelSubscription,
      isSubscribed: user?.subscriptionStatus === "active"
    }),
    [activateSubscription, cancelSubscription, isReady, login, logout, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
