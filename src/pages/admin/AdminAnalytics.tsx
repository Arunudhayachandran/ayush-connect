import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, Building2, Calendar, Star,
  ArrowUp, ArrowDown, DollarSign
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['hsl(152 45% 28%)', 'hsl(262 47% 55%)', 'hsl(38 92% 50%)', 'hsl(199 89% 48%)', 'hsl(25 95% 53%)', 'hsl(330 65% 50%)'];

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [centersRes, bookingsRes, usersRes, reviewsRes] = await Promise.all([
        supabase.from('centers').select('id, city, service_types, average_rating, total_bookings, created_at'),
        supabase.from('bookings').select('id, status, total_amount, created_at, booking_date'),
        supabase.from('profiles').select('id, city, created_at'),
        supabase.from('reviews').select('id, rating, created_at'),
      ]);

      const centers = centersRes.data || [];
      const bookings = bookingsRes.data || [];
      const users = usersRes.data || [];
      const reviews = reviewsRes.data || [];

      // Monthly growth data (last 6 months)
      const monthlyData: { month: string; users: number; bookings: number; centers: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        monthlyData.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
          users: users.filter(u => {
            const d = new Date(u.created_at);
            return d >= monthStart && d <= monthEnd;
          }).length,
          bookings: bookings.filter(b => {
            const d = new Date(b.created_at);
            return d >= monthStart && d <= monthEnd;
          }).length,
          centers: centers.filter(c => {
            const d = new Date(c.created_at);
            return d >= monthStart && d <= monthEnd;
          }).length,
        });
      }

      // City distribution
      const cityDistribution: Record<string, number> = {};
      centers.forEach(c => {
        cityDistribution[c.city] = (cityDistribution[c.city] || 0) + 1;
      });
      const topCities = Object.entries(cityDistribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }));

      // Revenue by status
      const revenueByStatus = bookings.reduce((acc, b) => {
        const status = b.status || 'pending';
        acc[status] = (acc[status] || 0) + (b.total_amount || 0);
        return acc;
      }, {} as Record<string, number>);

      // Booking status distribution
      const statusDistribution = bookings.reduce((acc, b) => {
        const status = b.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Rating distribution
      const ratingDistribution = reviews.reduce((acc, r) => {
        acc[r.rating] = (acc[r.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const totalRevenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      return {
        monthlyData,
        topCities,
        revenueByStatus,
        statusDistribution: Object.entries(statusDistribution).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })),
        ratingDistribution: Object.entries(ratingDistribution)
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([rating, count]) => ({
            rating: `${rating} Star`,
            count,
          })),
        totalRevenue,
        avgRating: reviews.length > 0
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
          : '0.0',
        totalCenters: centers.length,
        totalUsers: users.length,
        totalBookings: bookings.length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">Comprehensive platform metrics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <span className="flex items-center text-xs text-primary">
              <ArrowUp className="w-3 h-3 mr-1" />
              12%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">₹{(analytics?.totalRevenue || 0).toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
            <span className="flex items-center text-xs text-primary">
              <ArrowUp className="w-3 h-3 mr-1" />
              8%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Completed Bookings</p>
          <p className="text-2xl font-bold">{analytics?.completedBookings || 0}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Average Rating</p>
          <p className="text-2xl font-bold">{analytics?.avgRating}/5</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-destructive" />
            </div>
            <span className="flex items-center text-xs text-primary">
              <ArrowUp className="w-3 h-3 mr-1" />
              15%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
          <p className="text-2xl font-bold">
            {analytics?.totalBookings && analytics.totalBookings > 0
              ? ((analytics.completedBookings / analytics.totalBookings) * 100).toFixed(1)
              : 0}%
          </p>
        </motion.div>
      </div>

      {/* Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold mb-4">Monthly Growth</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.monthlyData || []}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(262 47% 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(262 47% 55%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBookingsAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(152 45% 28%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(152 45% 28%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
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
                  dataKey="users"
                  stroke="hsl(262 47% 55%)"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                  name="New Users"
                />
                <Area
                  type="monotone"
                  dataKey="bookings"
                  stroke="hsl(152 45% 28%)"
                  fillOpacity={1}
                  fill="url(#colorBookingsAnalytics)"
                  strokeWidth={2}
                  name="Bookings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold mb-4">Booking Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.statusDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(analytics?.statusDistribution || []).map((_, index) => (
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
        </motion.div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold mb-4">Centers by City</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topCities || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="hsl(152 45% 28%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="font-display font-semibold mb-4">Rating Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.ratingDistribution || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="rating" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
