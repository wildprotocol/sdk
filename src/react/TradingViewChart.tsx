declare global {
  interface Window {
    ResizeObserver: typeof ResizeObserver;
  }
}

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  type Time,
  type IChartApi,
  type CandlestickData,
  type DeepPartial,
  type ChartOptions,
  CandlestickSeries,
  SeriesOptionsCommon,
  CandlestickStyleOptions,
} from "lightweight-charts";

type TradingViewChartProps = {
  token: string;
  interval: "1m" | "5m" | "15m" | "1h" | "4h" | "1d" | "1w" | "1M" | "1y";
  from?: number;
  to?: number;
  chain_id: string;
  apiUrl?: string;
  useMockIfEmpty?: boolean;
  theme?: DeepPartial<
    CandlestickStyleOptions & SeriesOptionsCommon & ChartOptions
  >; // theming support
};

export function TradingViewChart({
  token,
  interval,
  from,
  to,
  chain_id = "84532",
  apiUrl = "https://lp.microcash.me/api/v1/chaindata/price-chart",
  useMockIfEmpty = false,
  theme,
}: TradingViewChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#000" },
        textColor: "#d1d4dc",
        ...theme?.layout,
      },
      grid: {
        vertLines: { color: "#444", ...theme?.grid?.vertLines },
        horzLines: { color: "#444", ...theme?.grid?.horzLines },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        ...theme?.timeScale,
      },
      rightPriceScale: {
        borderVisible: false,
        ...theme?.rightPriceScale,
      },
      autoSize: true,
      ...theme,
    });

    chartInstanceRef.current = chart;

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: 12,
        minMove: 0.000000000001,
      },
      ...theme,
    });

    const fetchData = async () => {
      try {
        const query = new URLSearchParams({
          token_address: token,
          interval,
          chain_id: chain_id,
        });

        if (from) query.set("start_time", from.toString());
        if (to) query.set("end_time", to.toString());

        const res = await fetch(`${apiUrl}?${query}`);
        const json = await res.json();
        const candles = json?.candles ?? [];

        if (candles.length === 0 && useMockIfEmpty) {
          series.setData(dummyCandles);
        } else {
          const formatted = candles.map((c: any) => ({
            time: c.time as Time,
            open: Number(c.open),
            high: Number(c.high),
            low: Number(c.low),
            close: Number(c.close),
          })) as CandlestickData[];

          series.setData(formatted);
        }
      } catch (err) {
        console.error("Chart data error:", err);
        if (useMockIfEmpty) {
          series.setData(dummyCandles);
        }
      }
    };

    fetchData();

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (chartRef.current) {
          chart.resize(
            chartRef.current.clientWidth,
            chartRef.current.clientHeight
          );
        }
      });
      resizeObserver.observe(chartRef.current);
    }

    return () => {
      chart.remove();
      resizeObserver?.disconnect();
    };
  }, [token, interval, from, to, apiUrl, useMockIfEmpty, theme]);

  return <div ref={chartRef} style={{ width: "100%", height: "100%" }} />;
}

// Dummy fallback data
const dummyCandles: CandlestickData[] = [
  { time: "2018-12-22", open: 75.16, high: 82.84, low: 36.16, close: 45.72 },
  { time: "2018-12-23", open: 45.12, high: 53.9, low: 45.12, close: 48.09 },
  { time: "2018-12-24", open: 60.71, high: 60.71, low: 53.39, close: 59.29 },
  { time: "2018-12-25", open: 68.26, high: 68.26, low: 59.04, close: 60.5 },
  { time: "2018-12-26", open: 67.71, high: 105.85, low: 66.67, close: 91.04 },
  { time: "2018-12-27", open: 91.04, high: 121.4, low: 82.7, close: 111.4 },
  {
    time: "2018-12-28",
    open: 111.51,
    high: 142.83,
    low: 103.34,
    close: 131.25,
  },
  { time: "2018-12-29", open: 131.33, high: 151.17, low: 77.68, close: 96.43 },
  { time: "2018-12-30", open: 106.33, high: 110.2, low: 90.39, close: 98.1 },
  { time: "2018-12-31", open: 109.87, high: 114.69, low: 85.66, close: 111.26 },
];
