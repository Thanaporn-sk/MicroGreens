'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    Plugin
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { CloudRain, Thermometer, Download } from 'lucide-react';
import { getActiveLotsForWeather, getDailySalesData, getDailyHarvestData, getRealTimeWeather } from './actions';
import { useMemo } from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Map Open-Meteo codes to conditions
const getWeatherCondition = (code: number) => {
    if (code === 0) return 'Sunny';
    if (code >= 1 && code <= 3) return 'Partly Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95 && code <= 99) return 'Storms';
    return 'Clear';
};

const getWeatherIcon = (condition: string) => {
    switch (condition) {
        case 'Sunny': return '☀️';
        case 'Partly Cloudy': return '⛅';
        case 'Foggy': return '🌫️';
        case 'Rain':
        case 'Showers': return '🌧️';
        case 'Snow': return '❄️';
        case 'Storms': return '⛈️';
        case 'Clear': return '☀️';
        default: return '☀️';
    }
};

export default function WeatherPage() {
    const [currentMetric, setCurrentMetric] = useState<'temp' | 'rain'>('temp');
    const [activeLots, setActiveLots] = useState<any[]>([]);
    const [salesData, setSalesData] = useState<any[]>([]);
    const [harvestData, setHarvestData] = useState<any[]>([]);
    const [unifiedData, setUnifiedData] = useState<any[]>([]);
    const [ganttTooltip, setGanttTooltip] = useState<{
        visible: boolean;
        x: number;
        y: number;
        lot: any | null;
    }>({ visible: false, x: 0, y: 0, lot: null });

    const chartRef = useRef<any>(null);

    // Store Gantt bar positions for hit testing
    const ganttBarsRef = useRef<Array<{ x: number; y: number; width: number; height: number; lot: any }>>([]);

    const handleDownloadImage = () => {
        if (chartRef.current) {
            const chart = chartRef.current;
            const url = chart.toBase64Image('image/png', 1.0);
            const link = document.createElement('a');
            link.download = `microgreens-weather-analysis-${new Date().toISOString().split('T')[0]}.png`;
            link.href = url;
            link.click();
        }
    };

    useEffect(() => {
        async function loadData() {
            // 1. Fetch Real Weather
            const weather = await getRealTimeWeather();

            if (weather && weather.time) {
                const formattedData = weather.time.map((t: string, i: number) => {
                    const date = new Date(t);
                    const dayName = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); // "25 Jan"
                    const isSunday = date.getDay() === 0;
                    const isToday = new Date().toDateString() === date.toDateString();

                    return {
                        d: dayName,
                        cond: getWeatherCondition(weather.weather_code[i]),
                        h: Math.round(weather.temperature_2m_max[i]),
                        l: Math.round(weather.temperature_2m_min[i]),
                        r: weather.precipitation_probability_max[i],
                        isSunday,
                        isToday,
                        date: date
                    };
                });

                setUnifiedData(formattedData);

                // 2. Fetch Sales for this range
                if (formattedData.length > 0) {
                    const startDate = formattedData[0].date;
                    const endDate = formattedData[formattedData.length - 1].date;
                    getDailySalesData(startDate, endDate).then(setSalesData);
                    getDailyHarvestData(startDate, endDate).then(setHarvestData);
                }
            }

            // 3. Fetch Active Lots
            getActiveLotsForWeather().then(setActiveLots);
        }

        loadData();
    }, []);

    // Debug: Log activeLots state
    console.log('WeatherPage activeLots:', activeLots.length, activeLots);
    console.log('WeatherPage harvestData:', harvestData.length, harvestData);
    console.log('WeatherPage salesData:', salesData.length, salesData);

    const weekLinesPlugin: Plugin = useMemo(() => ({
        id: 'weekLines',
        afterDraw: (chart) => {
            if (unifiedData.length === 0) return;

            const { ctx, chartArea: { top, bottom, left, right }, scales: { x } } = chart;
            ctx.save();

            // 1. Draw Sunday vertical lines
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
            ctx.setLineDash([8, 6]);
            ctx.lineWidth = 1;

            unifiedData.forEach((day, index) => {
                if (day.isSunday) {
                    // @ts-ignore
                    const xPos = x.getPixelForValue(index);
                    if (xPos >= left && xPos <= right) {
                        ctx.beginPath();
                        ctx.moveTo(xPos, top);
                        ctx.lineTo(xPos, bottom);
                        ctx.stroke();

                        // Add "Sun" Label
                        ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
                        ctx.font = 'bold 8px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('SUN', xPos, top - 8);
                    }
                }
            });

            // 2. Draw Weather Icons
            unifiedData.forEach((day, index) => {
                // @ts-ignore
                const xPos = x.getPixelForValue(index);
                if (xPos >= left && xPos <= right) {
                    const icon = getWeatherIcon(day.cond);
                    ctx.font = '16px serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(icon, xPos, top - 22);
                }
            });

            // 3. Draw Lot Periods (Gantt Chart Style)
            const chartAreaHeight = bottom - top;
            const ganttTopY = bottom - (chartAreaHeight * 0.39);
            const barHeight = 10;
            const barGap = 3;

            // Clear previous bar positions
            ganttBarsRef.current = [];

            activeLots.forEach((lot, i) => {
                const plantingDate = new Date(lot.plantingDate);
                plantingDate.setHours(0, 0, 0, 0);
                const harvestDate = lot.expectedHarvestDate ? new Date(lot.expectedHarvestDate) : null;
                if (harvestDate) harvestDate.setHours(0, 0, 0, 0);

                const firstChartDate = new Date(unifiedData[0].date).setHours(0, 0, 0, 0);
                const lastChartDate = new Date(unifiedData[unifiedData.length - 1].date).setHours(0, 0, 0, 0);
                const plantTime = plantingDate.getTime();
                const harvestTime = harvestDate ? harvestDate.getTime() : (new Date().setHours(0, 0, 0, 0) + 5 * 86400000);

                if (harvestTime < firstChartDate || plantTime > lastChartDate) {
                    return;
                }

                // Find start index
                let startIndex = -1;
                const plantKey = new Date(lot.plantingDate).toISOString().split('T')[0];
                const firstDate = new Date(unifiedData[0].date);

                if (new Date(lot.plantingDate) < firstDate) {
                    startIndex = 0;
                } else {
                    startIndex = unifiedData.findIndex(d => d.date.toISOString().split('T')[0] === plantKey);
                    if (startIndex === -1) startIndex = unifiedData.findIndex(d => d.date.toISOString().split('T')[0] > plantKey);
                }

                if (startIndex === -1) return;

                // Find end index
                let endIndex = unifiedData.length - 1;
                const harvestKey = lot.expectedHarvestDate
                    ? new Date(lot.expectedHarvestDate).toISOString().split('T')[0]
                    : null;

                if (harvestKey) {
                    const foundIndex = unifiedData.findIndex(d => d.date.toISOString().split('T')[0] > harvestKey);
                    endIndex = foundIndex === -1 ? unifiedData.length - 1 : Math.max(0, foundIndex - 1);
                }

                if (endIndex < startIndex) return;

                // Draw
                if (startIndex !== -1 && endIndex !== -1) {
                    // @ts-ignore
                    const startX = x.getPixelForValue(startIndex);
                    // @ts-ignore
                    const endX = x.getPixelForValue(endIndex);

                    if (startX <= right && endX >= left) {
                        const clampedStartX = Math.max(left, startX);
                        const clampedEndX = Math.min(right, endX);
                        const width = clampedEndX - clampedStartX;

                        if (width < 5) return;

                        const level = i % 2;
                        const yPos = ganttTopY + (level * (barHeight + barGap));

                        // Store bar position for hit testing
                        ganttBarsRef.current.push({
                            x: clampedStartX,
                            y: yPos,
                            width: width,
                            height: barHeight,
                            lot: lot
                        });

                        // Draw Gantt Bar
                        ctx.save();
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
                        ctx.shadowBlur = 4;
                        ctx.shadowOffsetY = 2;

                        const gradient = ctx.createLinearGradient(clampedStartX, yPos, clampedEndX, yPos);
                        if (lot.cropType === 'Sunflower') {
                            gradient.addColorStop(0, '#facc15');
                            gradient.addColorStop(1, '#eab308');
                        } else {
                            gradient.addColorStop(0, '#4ade80');
                            gradient.addColorStop(1, '#22c55e');
                        }

                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.roundRect ? ctx.roundRect(clampedStartX, yPos, width, barHeight, 4) : ctx.rect(clampedStartX, yPos, width, barHeight);
                        ctx.fill();

                        ctx.strokeStyle = '#222';
                        ctx.lineWidth = 1;
                        ctx.stroke();

                        ctx.shadowColor = '#000';
                        ctx.shadowBlur = 4;
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 10px sans-serif';
                        ctx.textAlign = 'left';

                        const textLabel = `${lot.lotCode} (${lot.cropType})`;
                        const textWidthLabel = ctx.measureText(textLabel).width;

                        if (width > textWidthLabel + 10) {
                            ctx.fillText(textLabel, clampedStartX + 5, yPos + 12);
                        } else {
                            ctx.fillText(lot.lotCode, clampedStartX + 5, yPos + 12);
                        }

                        ctx.restore();
                    }
                }
            });

            ctx.restore();
        }
    }), [unifiedData, activeLots]);

    // Handle mouse move on chart to detect Gantt bar hover
    const handleChartMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Check if mouse is over any Gantt bar
        const hoveredBar = ganttBarsRef.current.find(bar =>
            mouseX >= bar.x && mouseX <= bar.x + bar.width &&
            mouseY >= bar.y && mouseY <= bar.y + bar.height
        );

        if (hoveredBar) {
            setGanttTooltip({
                visible: true,
                x: event.clientX - rect.left + 10,
                y: event.clientY - rect.top - 10,
                lot: hoveredBar.lot
            });
        } else {
            if (ganttTooltip.visible) {
                setGanttTooltip({ visible: false, x: 0, y: 0, lot: null });
            }
        }
    };

    const handleChartMouseLeave = () => {
        setGanttTooltip({ visible: false, x: 0, y: 0, lot: null });
    };

    const chartData = useMemo(() => ({
        labels: unifiedData.map(i => i.d),
        datasets: [
            // Weather Datasets
            ...(currentMetric === 'temp' ? [
                {
                    type: 'line' as const,
                    label: 'Max Temp (°C)',
                    data: unifiedData.map(i => i.h),
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.05)',
                    borderWidth: 4,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: (context: any) => unifiedData[context.dataIndex]?.isToday ? '#2563eb' : '#f97316',
                    pointRadius: (context: any) => unifiedData[context.dataIndex]?.isToday ? 8 : 4,
                    pointHoverRadius: 10,
                    yAxisID: 'y',
                    order: 4
                },
                {
                    type: 'line' as const,
                    label: 'Min Temp (°C)',
                    data: unifiedData.map(i => i.l),
                    borderColor: '#60a5fa',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [8, 4],
                    tension: 0.4,
                    pointBackgroundColor: (context: any) => unifiedData[context.dataIndex]?.isToday ? '#2563eb' : '#60a5fa',
                    pointRadius: (context: any) => unifiedData[context.dataIndex]?.isToday ? 8 : 3,
                    pointHoverRadius: 6,
                    yAxisID: 'y',
                    order: 5
                }
            ] : [
                {
                    type: 'bar' as const,
                    label: 'Precipitation Chance (%)',
                    data: unifiedData.map(i => i.r),
                    backgroundColor: (context: any) => unifiedData[context.dataIndex]?.isToday ? '#2563eb' : '#bae6fd',
                    borderRadius: 8,
                    hoverBackgroundColor: '#0284c7',
                    yAxisID: 'y',
                    order: 4
                }
            ]),
            // Harvest Dataset (16-30% height)
            {
                type: 'bar' as const,
                label: 'Harvest (kg)',
                data: unifiedData.map(day => {
                    const isoKey = day.date.toISOString().split('T')[0];
                    const localKey = day.date.toLocaleDateString('en-CA');
                    const record = harvestData.find(h => h.date === isoKey || h.date === localKey);
                    return record ? record.total : 0;
                }),
                backgroundColor: '#22c55e',
                hoverBackgroundColor: '#16a34a',
                borderColor: '#22c55e',
                borderWidth: 0,
                borderRadius: 4,
                yAxisID: 'y2',
                barThickness: 12,
                grouped: false,
                order: 2
            },
            // Sales Dataset (0-15% height)
            {
                type: 'bar' as const,
                label: 'Sales (THB)',
                data: unifiedData.map(day => {
                    const isoKey = day.date.toISOString().split('T')[0];
                    const localKey = day.date.toLocaleDateString('en-CA');
                    const record = salesData.find(s => s.date === isoKey || s.date === localKey);
                    return record ? record.total : 0;
                }),
                backgroundColor: 'rgba(147, 51, 234, 0.5)',
                borderColor: 'rgba(147, 51, 234, 0.8)',
                borderWidth: 1,
                borderRadius: 4,
                hoverBackgroundColor: '#9333ea',
                yAxisID: 'y1',
                barThickness: 12,
                grouped: false,
                order: 3
            }
        ] as any[]
    }), [unifiedData, currentMetric, harvestData, salesData]);


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: { top: 35, bottom: 10 }
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
                align: 'center' as const,
                labels: {
                    font: { weight: 'bold' as const, size: 10 },
                    padding: 8,
                    boxWidth: 12,
                    usePointStyle: true
                }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                padding: 20,
                backgroundColor: '#020617',
                titleFont: { size: 14 },
                callbacks: {
                    label: (context: any) => {
                        const label = context.dataset.label || '';
                        const value = context.formattedValue;
                        const dataIndex = context.dataIndex;

                        if (context.dataset.yAxisID === 'y1') {
                            return `${label}: ฿${value}`;
                        }
                        if (context.dataset.yAxisID === 'y2') {
                            // Get bag count for this date
                            const day = unifiedData[dataIndex];
                            if (day) {
                                const isoKey = day.date.toISOString().split('T')[0];
                                const localKey = day.date.toLocaleDateString('en-CA');
                                const record = harvestData.find(h => h.date === isoKey || h.date === localKey);
                                const bagCount = record?.bagCount || 0;
                                return [`${label}: ${value} kg`, `จำนวน: ${bagCount} bags`];
                            }
                            return `${label}: ${value} kg`;
                        }
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        scales: {
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                grid: { color: '#f1f5f9', drawBorder: false },
                ticks: { font: { size: 11, weight: 'bold' as const }, color: '#94a3b8' },
                suggestedMin: currentMetric === 'temp' ? 15 : 0,
                title: {
                    display: true,
                    text: currentMetric === 'temp' ? 'Temperature (°C)' : 'Precipitation (%)',
                    font: { size: 9, weight: 'bold' }
                }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: { display: false },
                ticks: { font: { size: 9, weight: 'bold' as const }, color: '#a855f7' },
                beginAtZero: true,
                suggestedMax: (() => {
                    const vals = unifiedData.map(day => {
                        const isoKey = day.date.toISOString().split('T')[0];
                        const localKey = day.date.toLocaleDateString('en-CA');
                        const record = salesData.find(s => s.date === isoKey || s.date === localKey);
                        return record ? record.total : 0;
                    });
                    const max = Math.max(...vals, 100);
                    return max / 0.10; // Keep Sales VERY low (0-10% height)
                })(),
                title: {
                    display: true,
                    text: 'Sales (THB)',
                    color: '#a855f7',
                    font: { size: 9, weight: 'bold' }
                }
            },
            y2: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                grid: { display: false },
                beginAtZero: true, // Bars start from 0
                suggestedMax: (() => {
                    // Find max harvest in range
                    const vals = unifiedData.map(day => {
                        const isoKey = day.date.toISOString().split('T')[0];
                        const localKey = day.date.toLocaleDateString('en-CA');
                        const record = harvestData.find(h => h.date === isoKey || h.date === localKey);
                        return record ? record.total : 0;
                    });
                    const maxVal = Math.max(...vals, 1);
                    // Scale so max harvest is at ~25% of chart height
                    return maxVal / 0.25;
                })(),
                title: {
                    display: true,
                    text: 'Harvest (kg)',
                    color: '#22c55e',
                    font: { size: 9, weight: 'bold' }
                },
                ticks: {
                    color: '#22c55e'
                }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 10, weight: 'bold' as const }, color: '#475569', maxRotation: 45 }
            }
        }
    };

    const chartOptions = useMemo(() => ({
        ...options as any,
        animation: false
    }), [options]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-10" >
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-900 text-slate-900 dark:text-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-gray-800 relative overflow-hidden">
                <div className="z-10 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                        <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-green-500/20">SR</div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Si Racha Climate Intelligence</h1>
                            <p className="text-green-400 text-xs font-bold uppercase tracking-[0.3em] mt-1">Weather.com Data Analytics</p>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                        5-Week Forecast with Sunday Dividers <span className="text-slate-900 dark:text-white font-bold">(Data as of {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})</span>
                    </p>
                </div>
                <div className="z-10 mt-8 md:mt-0 flex flex-col items-center md:items-end gap-3">
                    <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700 rounded-2xl shadow-inner">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Current Temp</span>
                            <span className="text-xl font-black text-orange-500">
                                {unifiedData.find(d => d.isToday)?.h || '--'}°C
                            </span>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Rain Chance</span>
                            <span className="text-xl font-black text-emerald-500">
                                {unifiedData.find(d => d.isToday)?.r || '--'}%
                            </span>
                        </div>
                    </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-green-600/10 rounded-full blur-[80px]"></div>
            </header >

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
                {/* Total Harvest Weight */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-3 rounded-xl shadow-md relative overflow-hidden">
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
                    <div className="relative z-10">
                        <p className="text-green-100 text-[9px] font-bold uppercase tracking-wider mb-1">ผลผลิตรวม</p>
                        <p className="text-xl font-black">
                            {harvestData.reduce((sum, h) => sum + (h.total || 0), 0).toFixed(2)}
                            <span className="text-xs ml-1">kg</span>
                        </p>
                        <p className="text-green-200 text-[10px] mt-1">
                            {unifiedData.length > 0 ? `${unifiedData[0]?.d} - ${unifiedData[unifiedData.length - 1]?.d}` : '-'}
                        </p>
                    </div>
                </div>

                {/* Total Bags */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-3 rounded-xl shadow-md relative overflow-hidden">
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
                    <div className="relative z-10">
                        <p className="text-amber-100 text-[9px] font-bold uppercase tracking-wider mb-1">จำนวนถุง</p>
                        <p className="text-xl font-black">
                            {harvestData.reduce((sum, h) => sum + (h.bagCount || 0), 0)}
                            <span className="text-xs ml-1">bags</span>
                        </p>
                        <p className="text-amber-200 text-[10px] mt-1">
                            {harvestData.filter(h => h.bagCount > 0).length} วันเก็บเกี่ยว
                        </p>
                    </div>
                </div>

                {/* Total Sales */}
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white p-3 rounded-xl shadow-md relative overflow-hidden">
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
                    <div className="relative z-10">
                        <p className="text-purple-100 text-[9px] font-bold uppercase tracking-wider mb-1">ยอดขายรวม</p>
                        <p className="text-xl font-black">
                            ฿{salesData.reduce((sum, s) => sum + (s.total || 0), 0).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <p className="text-purple-200 text-[10px] mt-1">
                            {salesData.filter(s => s.total > 0).length} วันขาย
                        </p>
                    </div>
                </div>

                {/* Active Lots */}
                <div className="bg-gradient-to-br from-yellow-500 to-amber-600 text-white p-3 rounded-xl shadow-md relative overflow-hidden">
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
                    <div className="relative z-10">
                        <p className="text-yellow-100 text-[9px] font-bold uppercase tracking-wider mb-1">Active Lots</p>
                        <p className="text-xl font-black">
                            {activeLots.length}
                            <span className="text-xs ml-1">lots</span>
                        </p>
                        <p className="text-yellow-200 text-[10px] mt-1">
                            กำลังปลูก/เก็บเกี่ยว
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Chart Section */}
            < main className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-8 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100 dark:border-gray-700" >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 italic">
                            <span className="w-2 h-8 bg-green-600 rounded-full not-italic"></span>
                            5-Week Perspective Analysis
                        </h2>
                        <p className="text-slate-400 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            Current Day: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} (Week {Math.ceil(unifiedData.length / 14)}) • Vertical Lines mark Sunday
                        </p>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-gray-700 p-1.5 rounded-2xl border border-slate-200 dark:border-gray-600 shadow-inner">
                        <button
                            onClick={() => setCurrentMetric('temp')}
                            className={`px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest flex items-center gap-2 ${currentMetric === 'temp'
                                ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-md'
                                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <Thermometer className="w-4 h-4" />
                            Temperature
                        </button>
                        <button
                            onClick={() => setCurrentMetric('rain')}
                            className={`px-6 py-3 rounded-xl text-xs font-black transition-all uppercase tracking-widest ml-1 flex items-center gap-2 ${currentMetric === 'rain'
                                ? 'bg-white dark:bg-gray-800 text-slate-900 dark:text-white shadow-md'
                                : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <CloudRain className="w-4 h-4" />
                            Precipitation
                        </button>
                    </div>
                    <button
                        onClick={handleDownloadImage}
                        className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-200 dark:shadow-none active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Save Image
                    </button>
                </div>

                <div
                    className="relative w-full h-[450px]"
                    onMouseMove={handleChartMouseMove}
                    onMouseLeave={handleChartMouseLeave}
                >
                    {/* Gantt Tooltip */}
                    {ganttTooltip.visible && ganttTooltip.lot && (
                        <div
                            className="absolute z-50 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3 pointer-events-none"
                            style={{
                                left: ganttTooltip.x,
                                top: ganttTooltip.y,
                                transform: 'translateY(-100%)'
                            }}
                        >
                            <div className="font-bold text-green-400 mb-1">{ganttTooltip.lot.lotCode}</div>
                            <div className="text-gray-300">{ganttTooltip.lot.cropType}</div>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-400">Trays:</span>
                                    <span className="font-semibold text-yellow-400">{ganttTooltip.lot.trayCount || '-'}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-400">Seed:</span>
                                    <span className="font-semibold">{ganttTooltip.lot.seedUsed ? `${ganttTooltip.lot.seedUsed}g` : '-'}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={`font-semibold ${ganttTooltip.lot.status === 'HARVESTING' ? 'text-orange-400' : 'text-green-400'}`}>
                                        {ganttTooltip.lot.status}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-700 text-[10px] text-gray-400">
                                {new Date(ganttTooltip.lot.plantingDate).toLocaleDateString('th-TH')} → {ganttTooltip.lot.expectedHarvestDate ? new Date(ganttTooltip.lot.expectedHarvestDate).toLocaleDateString('th-TH') : 'TBD'}
                            </div>
                        </div>
                    )}
                    <Bar
                        ref={chartRef}
                        key={`chart-${activeLots.length}-${harvestData.length}-${salesData.length}-${currentMetric}`}
                        data={chartData}
                        options={chartOptions}
                        plugins={[weekLinesPlugin]}
                    />
                </div>

                <div className="mt-8 flex flex-wrap justify-center gap-6 md:gap-16 text-[9px] font-black text-slate-300 dark:text-gray-500 uppercase tracking-[0.4em]">
                    {unifiedData.length > 0 ? Array.from({ length: 5 }).map((_, i) => {
                        const date = unifiedData[i * 7]?.d || '-';
                        const isCurrentWeek = i === 2;
                        return (
                            <span key={i} className={isCurrentWeek ? "text-green-600 dark:text-green-400 ring-2 ring-green-50 dark:ring-green-900/30 px-4 py-1.5 rounded-full bg-green-50/30 dark:bg-green-900/20 font-black" : ""}>
                                Week {i + 1} ({date})
                            </span>
                        );
                    }) : (
                        <span>Loading Forecast...</span>
                    )}
                </div>
            </main>
            <footer className="text-center py-16 border-t border-slate-100 dark:border-gray-700 text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.5em]">
                &copy; 2026 Si Racha Meteorological Hub • v9.1 Dashboard
            </footer>
        </div>
    );
}
