import { useState } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "TheWealth - Trading Calendar" },
    { name: "description", content: "TradeCore market sessions, monthly trade history, and scheduled events." },
  ];
};

interface DayData {
  day: number;
  trades: number;
  pl: number;
  events?: { type: 'economic' | 'custom', label: string }[];
}

export default function Calendar() {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

  const sessions = [
    { name: "Sydney", open: "22:00", close: "07:00", active: false },
    { name: "Tokyo", open: "00:00", close: "09:00", active: true },
    { name: "London", open: "08:00", close: "17:00", active: false },
    { name: "New York", open: "13:00", close: "22:00", active: false },
  ];

  const events = [
    { date: "May 10", time: "14:30", event: "CPI Inflation Report (USD)", impact: "High", type: "Economic" },
    { date: "May 12", time: "19:00", event: "FOMC Meeting Minutes", impact: "High", type: "Economic" },
    { date: "May 15", time: "08:00", event: "Strategy Alpha Deployment", impact: "Medium", type: "Deployment" },
    { date: "May 16", time: "20:00", event: "Weekly Portfolio Review", impact: "Low", type: "Review" },
  ];

  const strategyRotation = [
    { day: "Monday", strategy: "Trend-following (H1/H4)", window: "London/NY Overlap" },
    { day: "Tuesday", strategy: "Mean Reversion (M15)", window: "Full Day" },
    { day: "Wednesday", strategy: "Range Bound / Scalping", window: "Tokyo/London" },
    { day: "Thursday", strategy: "Volatility Breakouts", window: "NY Session" },
    { day: "Friday", strategy: "News-based Discretionary", window: "AM Sessions" },
  ];

  // Mock Calendar Data for May
  const monthDays: DayData[] = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    let trades = 0;
    let pl = 0;
    let dayEvents: DayData['events'] = [];

    if (day % 3 === 0) {
      trades = Math.floor(Math.random() * 5) + 1;
      pl = (Math.random() * 1000) - 400;
    }
    
    if (day === 10) dayEvents.push({ type: 'economic', label: 'CPI' });
    if (day === 12) dayEvents.push({ type: 'economic', label: 'FOMC' });
    if (day === 15) dayEvents.push({ type: 'custom', label: 'Deploy' });

    return { day, trades, pl, events: dayEvents };
  });

  const totalPL = monthDays.reduce((acc, d) => acc + d.pl, 0);
  const totalTrades = monthDays.reduce((acc, d) => acc + d.trades, 0);
  const profitableDays = monthDays.filter(d => d.pl > 0).length;
  const tradingDays = monthDays.filter(d => d.trades > 0).length;
  const winRate = tradingDays > 0 ? (profitableDays / tradingDays) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Trading Calendar</h2>
          <p className="text-gray-400">Plan your sessions, track events, and rotate strategies.</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 uppercase tracking-widest">Current Time</p>
          <p className="text-xl font-mono text-blue-400">08:45:12 UTC</p>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left: Monthly Grid & Sessions (3/4 width) */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Monthly Calendar Grid */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white">May 2026</h3>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500/20 border border-green-500/50 rounded"></span> Profit</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500/20 border border-red-500/50 rounded"></span> Loss</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-gray-800 border border-gray-700 rounded"></span> No Trades</div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-gray-500 py-2 uppercase tracking-tighter">{d}</div>
              ))}
              
              {/* Empty cells for padding May 2026 starts on Friday */}
              <div className="h-24 bg-transparent"></div>
              <div className="h-24 bg-transparent"></div>
              <div className="h-24 bg-transparent"></div>
              <div className="h-24 bg-transparent"></div>
              <div className="h-24 bg-transparent"></div>

              {monthDays.map((d) => {
                const isProfit = d.pl > 0;
                const hasTrades = d.trades > 0;
                
                return (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDay(d)}
                    className={`h-28 p-2 rounded-xl border transition-all text-left flex flex-col justify-between group relative ${
                      !hasTrades ? 'bg-gray-900/20 border-gray-800/50 hover:border-gray-700' :
                      isProfit ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/50' :
                      'bg-red-500/5 border-red-500/20 hover:border-red-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">{d.day}</span>
                      <div className="flex gap-1">
                        {d.events?.map((ev, i) => (
                          <span key={i} title={ev.label} className={`w-1.5 h-1.5 rounded-full ${ev.type === 'economic' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                        ))}
                      </div>
                    </div>
                    
                    {hasTrades && (
                      <div className="space-y-1">
                        <div className={`text-xs font-mono font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                          {isProfit ? '+' : ''}{d.pl.toFixed(0)}
                        </div>
                        <div className="text-[10px] text-gray-500">{d.trades} trades</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Market Sessions Timeline (Relocated) */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Market Sessions & Timelines
              </h3>
              <span className="text-xs text-gray-500 font-mono italic">Timezone: UTC</span>
            </div>

            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.name} className="relative pt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className={`font-medium ${session.active ? 'text-white' : 'text-gray-400'}`}>
                      {session.name} {session.active && <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">Live</span>}
                    </span>
                    <span className="text-gray-500 font-mono">{session.open} - {session.close}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${session.active ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-700 opacity-30'}`}
                      style={{
                        marginLeft: `${(parseInt(session.open) / 24) * 100}%`,
                        width: `${((parseInt(session.close) - parseInt(session.open) + 24) % 24 / 24) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Sidebar Stats & Events (1/4 width) */}
        <div className="space-y-8">
          
          {/* Summary Stats */}
          <section className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-6">May Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-950/50 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Net P/L</p>
                <p className={`text-xl font-bold ${totalPL > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalPL > 0 ? '+' : ''}{totalPL.toFixed(0)}
                </p>
              </div>
              <div className="p-4 bg-gray-950/50 rounded-xl border border-white/5">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Win Rate</p>
                <p className="text-xl font-bold text-white">{winRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-gray-950/50 rounded-xl border border-white/5 col-span-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Total Trades</p>
                <p className="text-2xl font-bold text-blue-400">{totalTrades}</p>
              </div>
            </div>
          </section>

          {/* Scheduled Events */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-6">Upcoming Events</h3>
            <div className="space-y-4">
              {events.map((ev, i) => (
                <div key={i} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{ev.date} @ {ev.time}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${ev.impact === 'High' ? 'bg-red-500/20 text-red-400' :
                        ev.impact === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-gray-500/20 text-gray-400'
                      }`}>
                      {ev.impact} Impact
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">{ev.event}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{ev.type}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Strategy Checkpoints */}
          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Checklist</h3>
            <div className="space-y-3">
              {[
                "RISK_MAX_DAILY_LOSS audit",
                "MT5 log validation",
                "Alpha param optimization",
              ].map((check, i) => (
                <label key={i} className="flex items-center gap-3 p-3 bg-gray-800/20 rounded-lg cursor-pointer group hover:bg-gray-800/40 transition-all">
                  <input type="checkbox" className="rounded bg-gray-950 border-gray-700 text-blue-600" />
                  <span className="text-xs text-gray-400 group-hover:text-gray-200">{check}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Daily Drill-Down Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in zoom-in duration-300">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <div>
                <h3 className="text-2xl font-bold text-white">May {selectedDay.day}, 2026</h3>
                <p className="text-gray-400 text-sm">Performance and activity drill-down.</p>
              </div>
              <button 
                onClick={() => setSelectedDay(null)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Day Stats Row */}
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                  <p className="text-[10px] uppercase text-gray-500 mb-1">Result</p>
                  <p className={`text-xl font-bold ${selectedDay.pl > 0 ? 'text-green-400' : selectedDay.pl < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                    {selectedDay.pl > 0 ? '+' : ''}{selectedDay.pl.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                  <p className="text-[10px] uppercase text-gray-500 mb-1">Volume</p>
                  <p className="text-xl font-bold text-white">{selectedDay.trades} Trades</p>
                </div>
                <div className="p-4 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                  <p className="text-[10px] uppercase text-gray-500 mb-1">Alpha Type</p>
                  <p className="text-xl font-bold text-blue-400">Mean Rev</p>
                </div>
              </div>

              {/* Mock Trade List */}
              <div>
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Trade Execution List
                </h4>
                <div className="bg-gray-950/50 rounded-2xl border border-gray-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-gray-900 border-b border-gray-800">
                        <th className="p-4 font-semibold text-gray-500">Asset</th>
                        <th className="p-4 font-semibold text-gray-500">Side</th>
                        <th className="p-4 font-semibold text-gray-500">Lots</th>
                        <th className="p-4 font-semibold text-gray-500 text-right">P/L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {selectedDay.trades > 0 ? Array.from({ length: selectedDay.trades }).map((_, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-medium text-gray-200">EURUSD</td>
                          <td className="p-4"><span className={i % 2 === 0 ? 'text-blue-400' : 'text-red-400'}>{i % 2 === 0 ? 'BUY' : 'SELL'}</span></td>
                          <td className="p-4 text-gray-400">0.50</td>
                          <td className={`p-4 text-right font-mono ${i % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {i % 2 === 0 ? '+' : '-'}{(Math.random() * 200).toFixed(2)}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="p-8 text-center text-gray-600 italic">No execution data for this period.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3">Post-Session Notes</h4>
                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl italic text-sm text-gray-400">
                  {selectedDay.pl > 0 ? "Strategy performed as expected during London overlap. Volatility was favorable for breakout execution." : 
                   selectedDay.pl < 0 ? "Stopped out on news spike. Risk limits held correctly. Review SL placement for NFP-like events." :
                   "No high-probability setups identified. Capital preserved."}
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-950/50 border-t border-gray-800 flex justify-end">
              <button 
                onClick={() => setSelectedDay(null)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
