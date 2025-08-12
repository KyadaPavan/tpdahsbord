import React, { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function Home() {
  const [animateCards, setAnimateCards] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  const chartData = [
    { name: "Jan", users: 400, revenue: 2400, sessions: 1200 },
    { name: "Feb", users: 300, revenue: 1398, sessions: 1100 },
    { name: "Mar", users: 500, revenue: 3200, sessions: 1500 },
    { name: "Apr", users: 200, revenue: 1800, sessions: 900 },
    { name: "May", users: 450, revenue: 2800, sessions: 1350 },
    { name: "Jun", users: 380, revenue: 2200, sessions: 1250 },
  ];

  const stats = [
    {
      title: "Total Users",
      value: "2,230",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "from-purple-500 to-purple-700",
      bgColor: "bg-white/80 ",
    },
    {
      title: "Revenue",
      value: "$14.8k",
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
      color: "from-indigo-500 to-indigo-700",
      bgColor: "bg-white/80 ",
    },
    {
      title: "Sessions",
      value: "7,325",
      change: "-2.1%",
      trend: "down",
      icon: Activity,
      color: "from-pink-500 to-pink-700",
      bgColor: "bg-white/80 ",
    },
    {
      title: "Page Views",
      value: "18.2k",
      change: "+15.3%",
      trend: "up",
      icon: Eye,
      color: "from-emerald-500 to-emerald-700",
      bgColor: "bg-white/80 ",
    },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="z-[9999] p-4 bg-white border border-purple-100 shadow-2xl rounded-xl backdrop-blur-sm relative">
          <p className="mb-2 font-semibold text-gray-700">{`Month: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100/80 rounded-2xl">
      <div className="relative p-4 mx-auto space-y-8 md:p-6 lg:p-14">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="mb-4 text-3xl font-semibold  md:text-3xl  text-[#5e35b1] animate-fade-in">
            Dashboard Overview
          </h1>
          <p className="max-w-2xl text-lg text-gray-600 md:text-xl">
            Real-time insights and analytics for your business growth
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 mb-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`${
                  stat.bgColor
                } rounded-2xl p-6 shadow-lg hover:shadow-2xl transform transition-all duration-500 ${
                  animateCards
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                } border border-white/50 backdrop-blur-sm hover:scale-105 cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      stat.trend === "up" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span className="text-sm font-semibold">{stat.change}</span>
                  </div>
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium text-gray-600">
                    {stat.title}
                  </h3>
                  <p
                    className={`text-3xl font-bold bg-gradient-to-r ${
                      stat.color
                    } bg-clip-text text-transparent transform transition-transform duration-300 ${
                      hoveredCard === index ? "scale-110" : "scale-100"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* User Growth Chart */}
          <div className="p-8 transition-all duration-500 transform border border-purple-100 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl hover:shadow-3xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-gray-800">
                  User Growth
                </h3>
                <p className="text-gray-600">Monthly active users trend</p>
              </div>
              <div className="p-3 shadow-lg bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="relative z-0">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#3b158a" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#7c3aed"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="users"
                    fill="url(#barGradient)"
                    radius={[12, 12, 0, 0]}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Trend Chart */}
          <div className="p-8 transition-all duration-500 transform border border-purple-100 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl hover:shadow-3xl hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="mb-2 text-2xl font-bold text-gray-800">
                  Revenue Trend
                </h3>
                <p className="text-gray-600">Monthly revenue performance</p>
              </div>
              <div className="p-3 shadow-lg bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="relative z-0">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop
                        offset="100%"
                        stopColor="#6366f1"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 14 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sessions Chart - Full Width */}
        <div className="p-8 transition-all duration-500 transform border border-purple-100 shadow-2xl bg-white/80 backdrop-blur-sm rounded-3xl hover:shadow-3xl hover:-translate-y-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="mb-2 text-2xl font-bold text-gray-800">
                Session Analytics
              </h3>
              <p className="text-gray-600">
                User engagement and session duration
              </p>
            </div>
            <div className="p-3 shadow-lg bg-gradient-to-r from-pink-500 to-pink-700 rounded-xl">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="relative z-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 14 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 14 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="url(#lineGradient)"
                  strokeWidth={4}
                  dot={{ fill: "#ec4899", strokeWidth: 2, r: 6 }}
                  activeDot={{
                    r: 8,
                    stroke: "#ec4899",
                    strokeWidth: 2,
                    fill: "#fff",
                  }}
                  className="transition-opacity duration-200 hover:opacity-80"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .hover\\:shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
