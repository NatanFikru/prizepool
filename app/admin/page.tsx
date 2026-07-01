"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, Wallet, Trophy, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_MATCHES, MOCK_TRANSACTIONS } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", volume: 4000 },
  { name: "Tue", volume: 3000 },
  { name: "Wed", volume: 2000 },
  { name: "Thu", volume: 2780 },
  { name: "Fri", volume: 1890 },
  { name: "Sat", volume: 2390 },
  { name: "Sun", volume: 3490 },
];

export default function Admin() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row w-full max-w-full">
      {/* Sidebar for Desktop / Top Nav for Mobile */}
      <div className="md:w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 text-primary font-black tracking-widest italic text-xl mb-1">
            <Trophy fill="currentColor" size={24} />
            PRIZEPOOL
          </div>
          <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Admin Dashboard</p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium">
            <Activity size={18} />
            Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary font-medium transition-colors">
            <Trophy size={18} />
            Matches
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary font-medium transition-colors">
            <Users size={18} />
            Users
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary font-medium transition-colors">
            <Wallet size={18} />
            Transactions
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-secondary font-medium transition-colors">
            <Settings size={18} />
            Settings
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border bg-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-black tracking-widest italic">
            <Trophy fill="currentColor" size={20} />
            ADMIN
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  Total Users
                  <Users size={14} className="text-blue-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">12,450</div>
                <p className="text-xs text-green-500 mt-1">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  Active Matches
                  <Trophy size={14} className="text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground mt-1">6 live right now</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  Total Volume
                  <Wallet size={14} className="text-green-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">845k ETB</div>
                <p className="text-xs text-green-500 mt-1">+5% from yesterday</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                  Active Pools
                  <Activity size={14} className="text-purple-500" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">142</div>
                <p className="text-xs text-muted-foreground mt-1">Across all matches</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="bg-card border border-border w-full justify-start overflow-x-auto h-auto p-1 mb-6">
              <TabsTrigger value="matches" className="px-4 py-2">Matches</TabsTrigger>
              <TabsTrigger value="analytics" className="px-4 py-2">Analytics</TabsTrigger>
              <TabsTrigger value="transactions" className="px-4 py-2">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Manage Matches</h2>
                <Button size="sm" className="gap-2">
                  <Plus size={14} /> Add Match
                </Button>
              </div>
              
              <div className="border border-border rounded-xl overflow-x-auto bg-card">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Match</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">League</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Boost</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_MATCHES.map((match) => (
                      <tr key={match.id} className="hover:bg-secondary/20">
                        <td className="px-4 py-3 font-medium">{match.teamA} vs {match.teamB}</td>
                        <td className="px-4 py-3 text-muted-foreground">{match.league}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            match.status === 'live' ? 'bg-green-500/10 text-green-500' :
                            match.status === 'completed' ? 'bg-secondary text-muted-foreground' :
                            'bg-blue-500/10 text-blue-500'
                          }`}>
                            {match.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {match.boostActive ? <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-1 rounded">Active</span> : <span className="text-muted-foreground text-xs">Inactive</span>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm" className="h-8 text-xs">Edit</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Volume History (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ETB`} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333' }} />
                        <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <div className="border border-border rounded-xl overflow-x-auto bg-card">
                <table className="w-full text-sm text-left">
                  <thead className="bg-secondary/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOCK_TRANSACTIONS.map((tx) => (
                      <tr key={tx.id} className="hover:bg-secondary/20">
                        <td className="px-4 py-3 font-mono text-muted-foreground">#{tx.id}</td>
                        <td className="px-4 py-3 font-medium">{tx.type}</td>
                        <td className={`px-4 py-3 font-bold ${tx.type === 'Withdrawal' ? '' : 'text-primary'}`}>
                          {tx.type === 'Withdrawal' ? '-' : '+'}{tx.amount}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{tx.date}</td>
                        <td className="px-4 py-3 text-green-500">{tx.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
