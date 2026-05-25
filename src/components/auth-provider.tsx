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

type AuthResult = {
  ok: boolean;
  message?: string;
};

type AuthContextValue = {
  user: DemoUser | null;
  isReady: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => AuthResult;
  logout: () => void;
  activateSubscription: () => boolean;
  cancelSubscription: () => void;
  isSubscribed: boolean;
};

const STORAGE_KEY = "bookbridge_demo_user";
const ACCOUNTS_STORAGE_KEY = "bookbridge_demo_accounts";
const SUBSCRIPTION_COOKIE = "bookbridge_demo_subscription";

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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createDemoUserId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `user_${crypto.randomUUID()}`;
  }

  return `user_${Date.now()}`;
}

function getStoredAccounts() {
  if (typeof window === "undefined") {
    return demoUsers;
  }

  const savedAccounts = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
  const mergedAccounts = [...demoUsers];

  if (savedAccounts) {
    try {
      const parsedAccounts = JSON.parse(savedAccounts) as DemoUserWithPassword[];

      if (Array.isArray(parsedAccounts)) {
        parsedAccounts.forEach((account) => {
          if (!account?.email || !account.password) {
            return;
          }

          const accountIndex = mergedAccounts.findIndex(
            (demoUser) => normalizeEmail(demoUser.email) === normalizeEmail(account.email)
          );

          if (accountIndex >= 0) {
            mergedAccounts[accountIndex] = account;
            return;
          }

          mergedAccounts.push(account);
        });
      }
    } catch {
      window.localStorage.removeItem(ACCOUNTS_STORAGE_KEY);
    }
  }

  return mergedAccounts;
}

function saveAccounts(accounts: DemoUserWithPassword[]) {
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function saveAccountUpdate(nextUser: DemoUser) {
  const accounts = getStoredAccounts();
  const accountIndex = accounts.findIndex(
    (account) => account.id === nextUser.id || normalizeEmail(account.email) === normalizeEmail(nextUser.email)
  );

  if (accountIndex < 0) {
    return false;
  }

  accounts[accountIndex] = {
    ...accounts[accountIndex],
    ...nextUser
  };
  saveAccounts(accounts);
  return true;
}

const USER_EMAIL_COOKIE = "bookbridge_user_email";

function syncSubscriptionCookie(nextUser: DemoUser | null) {
  const cookieBase = `${SUBSCRIPTION_COOKIE}=; path=/; SameSite=Lax`;

  if (nextUser?.subscriptionStatus !== "active") {
    document.cookie = `${cookieBase}; max-age=0`;
    document.cookie = `${USER_EMAIL_COOKIE}=; path=/; SameSite=Lax; max-age=0`;
    return;
  }

  document.cookie = `${SUBSCRIPTION_COOKIE}=active; path=/; SameSite=Lax; max-age=2592000`;
  document.cookie = `${USER_EMAIL_COOKIE}=${encodeURIComponent(nextUser.email)}; path=/; SameSite=Lax; max-age=2592000`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    saveAccounts(getStoredAccounts());

    const savedUser = window.localStorage.getItem(STORAGE_KEY);

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as DemoUser;
        setUser(parsedUser);
        syncSubscriptionCookie(parsedUser);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
        syncSubscriptionCookie(null);
      }
    } else {
      syncSubscriptionCookie(null);
    }

    setIsReady(true);
  }, []);

  const saveUser = useCallback((nextUser: DemoUser | null) => {
    setUser(nextUser);

    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      syncSubscriptionCookie(nextUser);
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    syncSubscriptionCookie(null);
  }, []);

  const login = useCallback(
    (email: string, password: string) => {
      const matchedUser = getStoredAccounts().find(
        (demoUser) =>
          normalizeEmail(demoUser.email) === normalizeEmail(email) &&
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

  const register = useCallback(
    (name: string, email: string, password: string) => {
      const cleanName = name.trim();
      const cleanEmail = normalizeEmail(email);

      if (!cleanName) {
        return { ok: false, message: "Enter your full name." };
      }

      if (!cleanEmail || !cleanEmail.includes("@")) {
        return { ok: false, message: "Enter a valid email address." };
      }

      if (password.length < 6) {
        return { ok: false, message: "Password must be at least 6 characters." };
      }

      const accounts = getStoredAccounts();
      const emailTaken = accounts.some((account) => normalizeEmail(account.email) === cleanEmail);

      if (emailTaken) {
        return { ok: false, message: "An account already exists for that email." };
      }

      const nextAccount: DemoUserWithPassword = {
        id: createDemoUserId(),
        name: cleanName,
        email: cleanEmail,
        password,
        subscriptionStatus: "free"
      };

      saveAccounts([...accounts, nextAccount]);
      saveUser(stripPassword(nextAccount));
      return { ok: true };
    },
    [saveUser]
  );

  const logout = useCallback(() => {
    saveUser(null);
  }, [saveUser]);

  const activateSubscription = useCallback(() => {
    if (!user) {
      return false;
    }

    const updatedUser = {
      ...user,
      subscriptionStatus: "active",
      subscriptionEndsAt: getOneMonthFromNow()
    } satisfies DemoUser;

    saveAccountUpdate(updatedUser);
    saveUser(updatedUser);
    return true;
  }, [saveUser, user]);

  const cancelSubscription = useCallback(() => {
    if (!user) {
      return;
    }

    const updatedUser = {
      ...user,
      subscriptionStatus: "free",
      subscriptionEndsAt: undefined
    } satisfies DemoUser;

    saveAccountUpdate(updatedUser);
    saveUser(updatedUser);
  }, [saveUser, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      login,
      register,
      logout,
      activateSubscription,
      cancelSubscription,
      isSubscribed: user?.subscriptionStatus === "active"
    }),
    [activateSubscription, cancelSubscription, isReady, login, logout, register, user]
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
