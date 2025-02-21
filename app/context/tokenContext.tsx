"use client";
import {
  useState,
  ReactNode,
  createContext,
  useEffect,
  useContext,
} from "react";
import fetchToken from "../utilsFn/fetchToken";

type TokenContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
};
const TokenContext = createContext<TokenContextType | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    const getToken = async () => {
      const fetchedToken = await fetchToken();
      setToken(fetchedToken);
    };
    if (!token) getToken();
  }, [token]);
  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
}

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken must be used within TokenProvider");
  }
  return context;
};
