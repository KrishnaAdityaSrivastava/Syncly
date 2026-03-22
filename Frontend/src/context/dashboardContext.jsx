import { createContext, useContext } from "react";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ data, refresh, children }) => {
  return (
    <DashboardContext.Provider value={{ data, refresh }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
