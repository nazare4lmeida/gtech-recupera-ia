import { useApp } from "../../hooks/useAppStore";
import AdminDashboard from "./AdminDashboard";
import AdminResults from "./AdminResults";

const TABS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "results", icon: "📋", label: "Resultados" },
] as const;

type AdminTabId = (typeof TABS)[number]["id"];

interface Props {
  onToast: (msg: string, tone?: "info" | "success" | "error") => void;
}

export default function AdminScreen({ onToast }: Props) {
  const { state, setAdminTab } = useApp();

  const currentTab = (state.adminTab as AdminTabId) || "dashboard";

  function renderTab() {
    switch (currentTab) {
      case "dashboard":
        return <AdminDashboard />;

      case "results":
        return <AdminResults onToast={onToast} />;

      default:
        return <AdminDashboard />;
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-58px)] w-full">
      <aside className="w-[220px] flex-shrink-0 border-r border-border bg-surface">
        <div className="sticky top-[58px] h-[calc(100vh-58px)] overflow-y-auto py-5">
          <p className="px-5 pb-2 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted">
            Administração
          </p>

          <nav className="space-y-1">
            {TABS.map((tab) => {
              const active = currentTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex w-full items-center gap-3 border-l-2 px-5 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "border-primary bg-bg text-text"
                      : "border-transparent text-muted hover:bg-bg hover:text-text"
                  }`}
                >
                  <span className="w-5 text-center">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      <main className="flex-1 bg-bg p-6 md:p-8">{renderTab()}</main>
    </div>
  );
}