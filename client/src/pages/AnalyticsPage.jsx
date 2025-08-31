import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const fetchComplaintReport = async (groupBy) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`http://localhost:5000/api/reports/complaints?groupBy=${groupBy}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const fetchSystemStats = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get('http://localhost:5000/api/reports/system-stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const AnalyticsPage = () => {
  const [groupBy, setGroupBy] = useState('status');
  const [chartType, setChartType] = useState('bar');

  const { data: complaintData, isLoading: complaintsLoading, isError: complaintsError } = useQuery({
    queryKey: ['complaintReports', groupBy],
    queryFn: () => fetchComplaintReport(groupBy),
  });

  const { data: systemStats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['systemStats'],
    queryFn: fetchSystemStats,
  });

  const chartData = complaintData?.map(item => ({ 
    name: item._id, 
    count: item.count,
    percentage: ((item.count / (complaintData.reduce((sum, curr) => sum + curr.count, 0))) * 100).toFixed(1)
  })) || [];

  const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (complaintsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-12 bg-neutral-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-neutral-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (complaintsError || statsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-6">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="text-danger-600 text-xl mb-4">Failed to load analytics data</div>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading text-primary-900">
                📊 System Analytics
              </h1>
              <p className="text-neutral-600 mt-2">
                Monitor system performance and complaint trends
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {chartData.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <div className="text-sm text-neutral-500">Total Complaints</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stats-card">
            <div className="stats-icon bg-primary-100 text-primary-600">
              📈
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {systemStats?.totalComplaints || 0}
              </div>
              <div className="stats-label">Total Complaints</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-success-100 text-success-600">
              ✅
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {systemStats?.resolvedComplaints || 0}
              </div>
              <div className="stats-label">Resolved</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-warning-100 text-warning-600">
              ⏳
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {systemStats?.pendingComplaints || 0}
              </div>
              <div className="stats-label">Pending</div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="stats-icon bg-info-100 text-info-600">
              🔄
            </div>
            <div className="stats-content">
              <div className="stats-number">
                {systemStats?.inProgressComplaints || 0}
              </div>
              <div className="stats-label">In Progress</div>
            </div>
          </div>
        </div>

        {/* Chart Controls */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-neutral-700 font-medium">Group By:</label>
              <select 
                onChange={(e) => setGroupBy(e.target.value)} 
                value={groupBy} 
                className="form-select min-w-[150px]"
              >
          <option value="status">Status</option>
          <option value="category">Category</option>
                <option value="month">Month</option>
                <option value="district">District</option>
        </select>
      </div>
            
            <div className="flex items-center gap-4">
              <label className="text-neutral-700 font-medium">Chart Type:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    chartType === 'bar' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  📊 Bar
                </button>
                <button
                  onClick={() => setChartType('pie')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    chartType === 'pie' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  🥧 Pie
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    chartType === 'line' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  📈 Line
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h2 className="text-2xl font-semibold text-white font-heading">
              📊 Complaints by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}
            </h2>
            <p className="text-primary-100 mt-1">
              Visual representation of complaint distribution
            </p>
          </div>
          
          <div className="p-8">
            {chartData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                  No data available
                </h3>
                <p className="text-neutral-500">
                  Try selecting a different grouping option
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Chart */}
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'bar' ? (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }}
                        />
            <Legend />
                        <Bar 
                          dataKey="count" 
                          fill="#3b82f6"
                          radius={[4, 4, 0, 0]}
                          stroke="#1d4ed8"
                          strokeWidth={1}
                        />
          </BarChart>
                    ) : chartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </PieChart>
                    ) : (
                      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          fontSize={12}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                          activeDot={{ r: 8, stroke: '#1d4ed8', strokeWidth: 2 }}
                        />
                      </LineChart>
                    )}
        </ResponsiveContainer>
                </div>

                {/* Data Table */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Detailed Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="table-enhanced w-full">
                      <thead>
                        <tr>
                          <th className="table-header">{groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</th>
                          <th className="table-header">Count</th>
                          <th className="table-header">Percentage</th>
                          <th className="table-header">Visual</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chartData.map((item, index) => (
                          <tr key={item.name} className="table-row">
                            <td className="table-cell font-medium">{item.name}</td>
                            <td className="table-cell">{item.count}</td>
                            <td className="table-cell">{item.percentage}%</td>
                            <td className="table-cell">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-3 rounded-full"
                                  style={{
                                    width: `${(item.count / Math.max(...chartData.map(d => d.count))) * 100}px`,
                                    backgroundColor: COLORS[index % COLORS.length]
                                  }}
                                ></div>
                                <span className="text-xs text-neutral-500">
                                  {item.count}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;