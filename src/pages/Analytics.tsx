import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import apiClient from '@/services/apiClient';

interface AnalyticsData {
  totalOrders: number;
  completedOrders: number;
  completionRate: string;
  overdueOrders: number;
  avgCompletionTime: number;
  ordersByStatus: Record<string, number>;
  ordersByPriority: Record<string, number>;
  stageAverages: Record<string, number>;
  ordersByDate: Record<string, number>;
  totalItems: number;
  avgItemsPerOrder: string;
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await apiClient.get('/api/orders/analytics');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="text-center py-20">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        <div className="text-center py-20 text-red-500">Failed to load analytics data</div>
      </div>
    );
  }

  // Prepare data for charts
  const statusData = Object.entries(data.ordersByStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    orders: count
  }));

  const priorityData = Object.entries(data.ordersByPriority).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count
  }));

  const stageTimeData = Object.entries(data.stageAverages).map(([stage, time]) => ({
    name: stage.charAt(0).toUpperCase() + stage.slice(1),
    hours: parseFloat((time / (1000 * 60 * 60)).toFixed(2))
  }));

  const ordersOverTime = Object.entries(data.ordersByDate).map(([date, count]) => ({
    date,
    orders: count
  })).slice(-14); // Last 14 days

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  const PRIORITY_COLORS = {
    'Urgent': '#EF4444',
    'High': '#F97316',
    'Normal': '#3B82F6',
    'Low': '#9CA3AF'
  };

  // Format time
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">📊 Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{data.completedOrders}</div>
            <p className="text-xs text-gray-500 mt-1">{data.completionRate}% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{data.overdueOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Completion Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(data.avgCompletionTime)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{data.totalItems}</div>
            <p className="text-xs text-gray-500 mt-1">across all orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Items per Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600">{data.avgItemsPerOrder}</div>
            <p className="text-xs text-gray-500 mt-1">items per order</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent as number * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Time per Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Average Time per Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#10B981" name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Over Time (Last 14 Days) */}
        <Card>
          <CardHeader>
            <CardTitle>Orders Created (Last 14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ordersOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#8B5CF6" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stage Performance Table */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Stage Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Stage</th>
                  <th className="text-right p-2 font-semibold">Current Orders</th>
                  <th className="text-right p-2 font-semibold">Avg. Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.ordersByStatus).map(([stage, count]) => (
                  <tr key={stage} className="border-b hover:bg-gray-50">
                    <td className="p-2 capitalize">{stage}</td>
                    <td className="p-2 text-right">{count}</td>
                    <td className="p-2 text-right">
                      {data.stageAverages[stage] 
                        ? formatTime(data.stageAverages[stage])
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

