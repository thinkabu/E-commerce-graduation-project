import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface PageTitleContextType {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(
  undefined,
);

export const PageTitleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [pageTitle, setPageTitle] = useState("Admin");

  return (
    <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
};

export const usePageTitle = (title?: string) => {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("usePageTitle must be used within PageTitleProvider");
  }
  // Lấy riêng setPageTitle ra để đảm bảo stable reference
  const { setPageTitle } = context;
  // Nếu được truyền title, set nó khi component mount
  React.useEffect(() => {
    if (title) {
      setPageTitle(title);
    }
    // Cleanup: reset về default khi unmount
    return () => {
      setPageTitle("Admin");
    };
  }, [title, setPageTitle]);
  return context;
};
