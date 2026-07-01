"use client";

import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine, Wallet as WalletIcon, Clock, CheckCircle2, Trophy } from "lucide-react";
import { MOCK_TRANSACTIONS } from "@/data/mockData";
import { motion } from "framer-motion";

export default function Wallet() {
  return (
    <div className="flex flex-col min-h-screen pb-24">
      <PageHeader title="My Wallet" />

      <main className="p-4 space-y-6">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-br from-card to-card/50 border-border border-2 overflow-hidden relative">
            <div className="absolute -right-12 -top-12 text-primary/10">
              <WalletIcon size={120} />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Available Balance</p>
                  <h2 className="text-4xl font-black text-foreground">1,240 <span className="text-xl text-primary">ETB</span></h2>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Locked in Picks</p>
                    <p className="font-bold text-sm">340 ETB</p>
                  </div>
                  <div className="w-px bg-border"></div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                    <p className="font-bold text-sm text-primary">1,580 ETB</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-14 font-bold text-base" data-testid="button-deposit">
            <ArrowDownToLine className="mr-2" size={18} />
            Deposit
          </Button>
          <Button variant="outline" className="h-14 font-bold text-base bg-card hover:bg-secondary" data-testid="button-withdraw">
            <ArrowUpFromLine className="mr-2" size={18} />
            Withdraw
          </Button>
        </div>

        {/* Transactions */}
        <section>
          <h3 className="font-bold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {MOCK_TRANSACTIONS.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-3 bg-card border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'Deposit' ? 'bg-blue-500/10 text-blue-500' :
                    tx.type === 'Withdrawal' ? 'bg-destructive/10 text-destructive' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {tx.type === 'Deposit' ? <ArrowDownToLine size={18} /> :
                     tx.type === 'Withdrawal' ? <ArrowUpFromLine size={18} /> :
                     <Trophy size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{tx.type}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={10} />
                      {tx.date}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${
                    tx.type === 'Withdrawal' ? 'text-foreground' : 'text-primary'
                  }`}>
                    {tx.type === 'Withdrawal' ? '-' : '+'}{tx.amount}
                  </p>
                  <div className="flex items-center gap-1 justify-end text-xs text-green-500">
                    <CheckCircle2 size={10} />
                    {tx.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
