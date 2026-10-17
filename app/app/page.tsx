"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Database,
  Package,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";

type Prediction = {
  forecast_date: string;
  category_code: string;
  predicted_demand: string;
};

type Recommendation = {
  category_code: string;
  predicted_demand: number;
  current_stock: number;
  recommended_order: number;
  days_of_supply: number;
  stockout_risk: string;
  expiry_risk: string;
};

type DashboardData = {
  predictions: Prediction[];
  recommendations: Recommendation[];
};

function RiskBadge({ level }: { level: string }) {
  const styles = {
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${
        styles[level as keyof typeof styles]
      }`}
    >
      {level}
    </span>
  );
}

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load dashboard data.");
        return (await response.json()) as DashboardData;
      })
      .then((data) => {
        if (active) setDashboardData(data);
      })
      .catch(() => {
        if (active) setLoadError("Dashboard data could not be loaded. Please try again.");
      });
    return () => {
      active = false;
    };
  }, []);

  const forecastData = useMemo(
    () =>
      (dashboardData?.predictions ?? [])
        .map((item) => ({
          code: item.category_code,
          demand: Number(item.predicted_demand),
          forecastDate: item.forecast_date,
        }))
        .sort((left, right) => right.demand - left.demand),
    [dashboardData],
  );
  const recommendations = dashboardData?.recommendations ?? [];
  const maxDemand = Math.max(1, ...forecastData.map((item) => item.demand));
  const forecastDate = forecastData[0]?.forecastDate;
  const forecastMonth = forecastDate
    ? new Date(`${forecastDate}T00:00:00`).toLocaleDateString("en", {
        month: "short",
        year: "numeric",
      })
    : "Loading…";
  const largestOrder = recommendations.reduce(
    (largest, item) => Math.max(largest, item.recommended_order),
    0,
  );
  const largestOrderCategory = recommendations.find(
    (item) => item.recommended_order === largestOrder,
  )?.category_code;

  return (
    <main className="min-h-screen bg-[#eef3f8] text-slate-950">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm">
              <Activity size={20} />
            </div>

            <div>
              <h1 className="text-sm font-bold tracking-tight">
                Hospital Medicine Forecasting
              </h1>
              <p className="text-xs font-medium text-slate-700">
                Demand prediction & inventory intelligence
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              Predictive Analysis Prototype
            </span>

            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <CalendarDays size={14} />
              Forecast: {forecastMonth}
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-7 px-6 py-9 lg:px-8 lg:py-10">
        {loadError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}
        {/* HERO */}
        <section className="animate-fade-up dashboard-card rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Hospital inventory intelligence
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Predict demand before it becomes a shortage.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-700 md:text-base">
              A forecasting and inventory decision-support system that uses
              historical pharmaceutical sales data to estimate upcoming demand
              and translate predictions into procurement recommendations.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-4">
            {[
              {
                icon: Database,
                title: "Historical Data",
                text: "Pharmaceutical sales",
              },
              {
                icon: TrendingUp,
                title: "Demand Forecast",
                text: "Linear regression",
              },
              {
                icon: Package,
                title: "Inventory Analysis",
                text: "Stock & risk rules",
              },
              {
                icon: CheckCircle2,
                title: "Recommendation",
                text: "Suggested orders",
              },
            ].map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-900">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-600">
                        {step.text}
                      </p>
                    </div>
                  </div>

                  {index < 3 && (
                    <ArrowRight
                      size={16}
                      className="mx-2 hidden shrink-0 text-slate-300 md:block"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* METRICS */}
        <section className="animate-fade-up-delay-1 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Pharmaceutical Categories",
              value: dashboardData ? String(forecastData.length) : "—",
              note: "ATC categories analyzed",
              icon: Package,
            },
            {
              label: "MAE",
              value: "60.91",
              note: "Linear Regression",
              icon: Activity,
            },
            {
              label: "RMSE",
              value: "118.24",
              note: "Linear Regression",
              icon: TrendingUp,
            },
            {
              label: "Largest Order",
              value: dashboardData ? String(largestOrder) : "—",
              note: largestOrderCategory ? `${largestOrderCategory} units` : "Largest suggested order",
              icon: ShieldAlert,
            },
          ].map((metric) => {
            const Icon = metric.icon;

            return (
              <div
                key={metric.label}
                className="dashboard-card rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-700">
                    {metric.label}
                  </p>

                  <Icon size={17} className="text-slate-600" />
                </div>

                <p className="mt-3 text-2xl font-bold tracking-tight">
                  {metric.value}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-700">{metric.note}</p>
              </div>
            );
          })}
        </section>

        {/* FORECAST + MODEL */}
        <section className="animate-fade-up-delay-2 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="dashboard-card rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">Demand Forecast</h3>

                <p className="mt-1 text-xs font-medium text-slate-700">
                  Predicted demand for the next month
                </p>
              </div>

              <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {forecastMonth}
              </span>
            </div>

            <div className="mt-7 space-y-4">
              {forecastData.map((item, index) => (
                <div key={item.code}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      {item.code}
                    </span>

                    <span className="tabular-nums font-medium text-slate-700">
                      {item.demand.toFixed(2)}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="forecast-bar h-full rounded-full bg-gradient-to-r from-blue-700 to-teal-600"
                      style={{
                        width: `${(item.demand / maxDemand) * 100}%`,
                        animationDelay: `${0.12 + index * 0.07}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card rounded-[1.5rem] border border-slate-200 bg-white p-7 text-slate-950 shadow-sm">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <BrainCircuit size={20} />
                </div>

                <h3 className="mt-5 text-xl font-semibold">
                  Model performance
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Linear Regression was evaluated against a naive historical
                  baseline using a time-based train/test split.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">MAE improvement</p>
                  <p className="mt-1 text-lg font-bold">1.39</p>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    lower error
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-600">RMSE improvement</p>
                  <p className="mt-1 text-lg font-bold">15.61</p>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    lower error
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INVENTORY TABLE */}
        <section className="animate-fade-up-delay-3 dashboard-card overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-7">
            <div>
              <h3 className="font-semibold">Inventory Recommendations</h3>

              <p className="mt-1 text-xs font-medium text-slate-700">
                Forecast-driven procurement suggestions
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-700">
              {dashboardData ? `${recommendations.length} categories` : "Loading…"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">
                    Predicted Demand
                  </th>
                  <th className="px-4 py-3 font-semibold">Current Stock</th>
                  <th className="px-4 py-3 font-semibold">
                    Recommended Order
                  </th>
                  <th className="px-4 py-3 font-semibold">Days Supply</th>
                  <th className="px-4 py-3 font-semibold">Stockout Risk</th>
                  <th className="px-4 py-3 font-semibold">Expiry Risk</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {recommendations.map((item) => (
                  <tr
                    key={item.category_code}
                    className="transition-colors hover:bg-blue-50/70"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {item.category_code}
                    </td>

                    <td className="px-4 py-4 tabular-nums text-slate-800">
                      {item.predicted_demand.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 tabular-nums text-slate-800">
                      {item.current_stock}
                    </td>

                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {item.recommended_order}
                    </td>

                    <td className="px-4 py-4 tabular-nums text-slate-800">
                      {item.days_of_supply.toFixed(1)}
                    </td>

                    <td className="px-4 py-4">
                      <RiskBadge level={item.stockout_risk} />
                    </td>

                    <td className="px-4 py-4">
                      <RiskBadge level={item.expiry_risk} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* OPERATIONAL IMPACT */}
        <section className="animate-fade-up-delay-4 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Demand visibility",
              text: "Estimate upcoming pharmaceutical demand from historical patterns instead of relying only on manual judgment.",
            },
            {
              title: "Smarter procurement",
              text: "Translate predicted demand and current stock into concrete suggested order quantities.",
            },
            {
              title: "Risk awareness",
              text: "Highlight potential stockout and expiry risks so inventory decisions can be prioritized.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="dashboard-card rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={17} className="text-teal-700" />

                <h3 className="text-sm font-semibold">{item.title}</h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">
                {item.text}
              </p>
            </div>
          ))}
        </section>

        {/* HOW IT WORKS */}
        <section className="animate-fade-up-delay-4 dashboard-card rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm">
          <h3 className="font-semibold">How the system works</h3>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              [
                "01",
                "Historical Data",
                "Monthly pharmaceutical sales are transformed into a forecasting dataset.",
              ],
              [
                "02",
                "Demand Forecasting",
                "A Linear Regression model predicts demand for the next month.",
              ],
              [
                "03",
                "Inventory Analysis",
                "Predictions are combined with current stock and incoming inventory.",
              ],
              [
                "04",
                "Recommendation",
                "Inventory rules calculate suggested procurement quantities and risks.",
              ],
            ].map(([number, title, text]) => (
              <div key={number} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <span className="text-xs font-bold text-blue-600">
                  {number}
                </span>

                <h4 className="mt-3 text-sm font-semibold">{title}</h4>

                <p className="mt-2 text-xs leading-5 text-slate-700">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-col gap-2 border-t border-slate-200 py-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Hospital Medicine Forecasting System · Academic Prototype
          </p>

          <p>
            Public pharmaceutical sales dataset · Demonstration inventory
            values
          </p>
        </footer>
      </div>
    </main>
  );
}
