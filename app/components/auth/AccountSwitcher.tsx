import { useState, useEffect } from "react";
import { fetchAccounts, switchAccount, type BrokerAccount } from "~/services/auth";
import { RefreshCw, Check, ChevronDown } from "lucide-react";

interface AccountSwitcherProps {
  activeAccount: BrokerAccount | null;
  onSwitch: (account: BrokerAccount) => void;
}

export default function AccountSwitcher({
  activeAccount,
  onSwitch,
}: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<BrokerAccount[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && accounts.length === 0) {
      setLoading(true);
      fetchAccounts()
        .then(setAccounts)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open, accounts.length]);

  const handleSwitch = async (account: BrokerAccount) => {
    try {
      const updated = await switchAccount(account.id);
      onSwitch(updated);
      setOpen(false);
    } catch {}
  };

  const label = activeAccount
    ? `${activeAccount.broker_type.toUpperCase()} — ${activeAccount.account_label}`
    : "No account";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-xs text-gray-400 hover:text-white bg-gray-800/50 rounded-lg px-3 py-2 transition-colors"
      >
        <RefreshCw className="w-3 h-3 shrink-0" />
        <span className="truncate flex-1 text-left">{label}</span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            {loading ? (
              <div className="px-3 py-4 text-xs text-gray-400 text-center">
                Loading...
              </div>
            ) : accounts.length === 0 ? (
              <div className="px-3 py-4 text-xs text-gray-500 text-center">
                No accounts linked
              </div>
            ) : (
              accounts.map((acc) => {
                const isActive =
                  activeAccount?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => handleSwitch(acc)}
                    className={`flex items-center gap-2 w-full px-3 py-2.5 text-xs text-left hover:bg-gray-700 transition-colors ${
                      isActive ? "text-blue-400 bg-blue-900/10" : "text-gray-300"
                    }`}
                  >
                    <span className="font-medium uppercase text-[10px] text-gray-500 w-8">
                      {acc.broker_type}
                    </span>
                    <span className="truncate flex-1">{acc.account_label}</span>
                    {isActive && <Check className="w-3 h-3 text-blue-400" />}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
