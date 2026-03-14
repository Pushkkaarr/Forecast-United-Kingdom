import { ForecastDashboard } from "@/components/ForecastDashboard";

export const metadata = {
  title: "UK Wind Forecast Monitor",
  description:
    "Visualise actual vs. forecasted UK national wind power generation with configurable forecast horizons.",
};

export default function Page() {
  return <ForecastDashboard />;
}
