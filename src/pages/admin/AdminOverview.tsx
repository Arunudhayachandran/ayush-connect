import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Building2, Users, Calendar, Star, TrendingUp, TrendingDown,
  CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const statCards = [
  { label: 'Total Centers', icon: Building2, color: 'hsl(152 45% 28%)' },
  { label: 'Total Users', icon: Users, color: 'hsl(262 47% 55%)' },
  { label: 'Total Bookings', icon: Calendar, color: 'hsl(38 92% 50%)' },
  { label: 'Avg Rating', icon: Star, color: 'hsl(142 55% 42%)' },
];

const COLORS = ['hsl(152 45% 28%)', 'hsl(262 47% 55%)', 'hsl(38 92% 50%)', 'hsl(199 89% 48%)', 'hsl(25 95% 53%)', 'hsl(330 65% 50%)'];

export default function AdminOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [centersRes, usersRes, bookingsRes, pendingCentersRes] = await Promise.all([
        supabase.from('centers').select('id, average_rating, is_verified, service_types', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id, status, created_at', { count: 'exact' }),
        supabase.from('centers').select('id', { count: 'exact' }).eq('is_verified', false),
      ]);

      const centers = centersRes.data || [];
      const avgRating = centers.length > 0 
        ? centers.reduce((acc, c) => acc + (c.average_rating || 0), 0) / centers.length 
        : 0;

      // Service type distribution
      const serviceDistribution: Record<string, number> = {};
      centers.forEach(center => {
        (center.service_types || []).forEach((type: string) => {
          serviceDistribution[type] = (serviceDistribution[type] || 0) + 1;
        });
      });

      // Bookings by week (last 8 weeks)
      const bookings = bookingsRes.data || [];
      const weeklyBookings: { week: string; count: number }[] = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);
        
        const count = bookings.filter(b => {
          const date = new Date(b.created_at);
          return date >= weekStart && date < weekEnd;
        }).length;
        
        weeklyBookings.push({
          week: `Week ${8 - i}`,
          count
        });
      }

      return {
        totalCenters: centersRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalBookings: bookingsRes.count || 0,
        avgRating: avgRating.toFixed(1),
        pendingVerifications: pendingCentersRes.count || 0,
        verifiedCenters: centers.filter(c => c.is_verified).length,
        serviceDistribution: Object.entries(serviceDistribution).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value
        })),
        weeklyBookings,
        recentBookings: bookings.slice(0, 5),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-24 mb-2" />
              <div className="h-8 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statValues = [
    stats?.totalCenters || 0,
    stats?.totalUsers || 0,
    stats?.totalBookings || 0,
    stats?.avgRating || '0.0',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold">{statValues[index]}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-semibold">Pending Verifications</p>
              <p className="text-sm text-muted-foreground">Centers awaiting approval</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-500">{stats?.pendingVerifications || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Verified Centers</p>
              <p className="text-sm text-muted-foreground">Active on platform</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-primary">{stats?.verifiedCenters || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="font-semibold">Flagged Reviews</p>
              <p className="text-sm text-muted-foreground">Requires moderation</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-destructive">0</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold mb-4">Bookings Trend (8 Weeks)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.weeklyBookings || []}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152 45% 28%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152 45% 28%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(152 45% 28%)"
                  fillOpacity={1}
                  fill="url(#colorBookings)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Service Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold mb-4">Service Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.serviceDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.serviceDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {(stats?.serviceDistribution || []).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
