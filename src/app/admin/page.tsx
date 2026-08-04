"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const data = [
  { name: "Sat", users: 4000, listings: 2400 },
  { name: "Sun", users: 3000, listings: 1398 },
  { name: "Mon", users: 2000, listings: 9800 },
  { name: "Tue", users: 2780, listings: 3908 },
  { name: "Wed", users: 1890, listings: 4800 },
  { name: "Thu", users: 2390, listings: 3800 },
  { name: "Fri", users: 3490, listings: 4300 },
];

const stats = [
  { title: "إجمالي المستخدمين", value: "24,562", change: "+12%", trend: "up", icon: Users },
  { title: "إجمالي الإعلانات", value: "8,245", change: "+5.4%", trend: "up", icon: Package },
  { title: "النمو الشهري", value: "18.2%", change: "-2%", trend: "down", icon: TrendingUp },
  { title: "الإيرادات التقديرية", value: "1.2M DZD", change: "+8%", trend: "up", icon: DollarSign },
];

export default function AdminOverview() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border hover:border-primary/50 transition-all group shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <stat.icon className="text-primary" size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="text-emerald-500" size={16} />
                ) : (
                  <ArrowDownRight className="text-rose-500" size={16} />
                )}
                <span className={stat.trend === "up" ? "text-emerald-500" : "text-rose-500"}>
                  {stat.change}
                </span>
                <span className="text-muted-foreground text-xs mr-1">منذ الشهر الماضي</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">تحليلات النمو</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4a6741" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4a6741" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}`} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} 
                  itemStyle={{ color: "#0f172a" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#4a6741" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">آخر النشاطات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                   <Users size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1 text-right" dir="rtl">
                  <p className="text-sm font-bold text-foreground">مستخدم جديد انضم للمنصة</p>
                  <p className="text-xs text-muted-foreground">منذ 10 دقائق • ولاية وهران</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
