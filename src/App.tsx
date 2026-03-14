/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, Play, Pause, RotateCcw, Plus, History, Wallet, Smartphone, CheckCircle2, X, ArrowRight } from 'lucide-react';

interface GameTicket {
  id: string;
  price: number;
  numbers: number[];
}

export default function App() {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickets, setTickets] = useState<GameTicket[]>([]);
  const [balance, setBalance] = useState(1000); // Starting balance
  const [showGPay, setShowGPay] = useState(false);
  const [gpayAmount, setGpayAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a random ticket
  const buyTicket = (price: number) => {
    if (balance < price) {
      alert("Incomplete balance!");
      return;
    }

    const numbersCount = price / 10;
    const numbers: number[] = [];
    while (numbers.length < numbersCount) {
      const num = Math.floor(Math.random() * 100) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    const newTicket: GameTicket = {
      id: Math.random().toString(36).substr(2, 9),
      price,
      numbers: numbers.sort((a, b) => a - b),
    };

    setTickets(prev => [...prev, newTicket]);
    setBalance(prev => prev - price);
  };

  const drawNextNumber = useCallback(() => {
    if (drawnNumbers.length >= 100) {
      setIsPlaying(false);
      return;
    }

    let nextNum: number;
    do {
      nextNum = Math.floor(Math.random() * 100) + 1;
    } while (drawnNumbers.includes(nextNum));

    setCurrentNumber(nextNum);
    setDrawnNumbers(prev => [nextNum, ...prev]);
  }, [drawnNumbers]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(drawNextNumber, 2000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, drawNextNumber]);

  const resetGame = () => {
    setIsPlaying(false);
    setCurrentNumber(null);
    setDrawnNumbers([]);
    setTickets([]);
    setBalance(1000);
  };

  const handleGPaySubmit = () => {
    const amount = parseFloat(gpayAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (amount > 50) {
      alert("Maximum deposit is ₹50");
      return;
    }

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setBalance(prev => prev + amount);
      
      // Close modal after success
      setTimeout(() => {
        setShowGPay(false);
        setPaymentSuccess(false);
        setGpayAmount('');
      }, 2000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-1">Ng gamings</h1>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium opacity-60">Random Number Game</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowGPay(true)}
              className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm border border-black/5 hover:bg-gray-50 transition-colors group"
            >
              <Smartphone className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-blue-600">Add Funds</span>
            </button>

            <div className="flex items-center gap-6 bg-white px-6 py-3 rounded-2xl shadow-sm border border-black/5">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <span className="text-xl font-mono font-semibold">₹{balance}</span>
              </div>
              <div className="h-8 w-px bg-black/10" />
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-indigo-600" />
                <span className="text-xl font-mono font-semibold">{tickets.length}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Display Area */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-[32px] p-12 shadow-sm border border-black/5 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <AnimatePresence mode="wait">
                {currentNumber ? (
                  <motion.div
                    key={currentNumber}
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="text-[160px] md:text-[200px] font-bold leading-none tracking-tighter text-indigo-600"
                  >
                    {currentNumber}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Play className="w-10 h-10 text-indigo-600 ml-1" />
                    </div>
                    <p className="text-xl font-medium text-black/40">Press Start to begin flashing</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4 mt-12">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold transition-all ${
                    isPlaying 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                  }`}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isPlaying ? 'Pause' : 'Start Flashing'}
                </button>
                <button
                  onClick={resetGame}
                  className="p-4 bg-white border border-black/10 rounded-2xl hover:bg-gray-50 transition-colors"
                  title="Reset Game"
                >
                  <RotateCcw className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Ticket Purchase */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Buy Tickets
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[100, 200, 300, 400, 500].map((price) => (
                  <button
                    key={price}
                    onClick={() => buyTicket(price)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl border border-black/5 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all group"
                  >
                    <span className="text-xs font-bold text-black/40 uppercase tracking-wider mb-1 group-hover:text-indigo-400">Ticket</span>
                    <span className="text-xl font-mono font-bold">₹{price}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: History & Active Tickets */}
          <div className="lg:col-span-5 space-y-8">
            {/* History */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <History className="w-5 h-5" /> History
              </h2>
              <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {drawnNumbers.length === 0 && <p className="text-black/30 italic text-sm">No numbers drawn yet</p>}
                {drawnNumbers.map((num, idx) => (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={`${num}-${idx}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                      idx === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-black/60'
                    }`}
                  >
                    {num}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Active Tickets */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 px-2">
                <Ticket className="w-5 h-5" /> Your Tickets
              </h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {tickets.length === 0 && (
                  <div className="bg-white/50 border border-dashed border-black/10 rounded-[32px] p-12 text-center">
                    <p className="text-black/30">No active tickets. Buy one to play!</p>
                  </div>
                )}
                {tickets.map((ticket) => (
                  <motion.div
                    layout
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={ticket.id}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">ID: {ticket.id}</span>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold">₹{ticket.price}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {ticket.numbers.map((num) => {
                        const isMatched = drawnNumbers.includes(num);
                        return (
                          <div
                            key={num}
                            className={`aspect-square rounded-xl flex items-center justify-center font-mono font-bold text-sm transition-all duration-500 ${
                              isMatched 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                                : 'bg-gray-50 text-black/40 border border-black/5'
                            }`}
                          >
                            {num}
                          </div>
                        );
                      })}
                    </div>
                    {ticket.numbers.every(n => drawnNumbers.includes(n)) && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-emerald-500/90 flex items-center justify-center text-white font-bold text-2xl backdrop-blur-sm"
                      >
                        WINNER!
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GPay Simulation Modal */}
      <AnimatePresence>
        {showGPay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowGPay(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              {/* GPay Header */}
              <div className="bg-[#4285F4] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-[#4285F4]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">Google Pay</h3>
                    <p className="text-xs opacity-80">UPI Payment Simulation</p>
                  </div>
                </div>
                {!isProcessing && (
                  <button onClick={() => setShowGPay(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="p-8">
                {paymentSuccess ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center py-8 space-y-4"
                  >
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-emerald-600">Payment Successful</h4>
                      <p className="text-black/40">₹{gpayAmount} added to your wallet</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-black/40">Enter Amount (Max ₹50)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-black/40">₹</span>
                        <input
                          type="number"
                          value={gpayAmount}
                          onChange={(e) => setGpayAmount(e.target.value)}
                          placeholder="0.00"
                          disabled={isProcessing}
                          className="w-full bg-gray-50 border-2 border-black/5 rounded-2xl py-4 pl-10 pr-4 text-2xl font-mono font-bold focus:border-blue-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Wallet className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        This is a simulated payment. No real money will be deducted from your account.
                      </p>
                    </div>

                    <button
                      onClick={handleGPaySubmit}
                      disabled={isProcessing || !gpayAmount}
                      className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                        isProcessing 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-[#4285F4] text-white hover:bg-[#3367D6] shadow-lg shadow-blue-200'
                      }`}
                    >
                      {isProcessing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                        />
                      ) : (
                        <>
                          Pay Securely <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 text-center border-t border-black/5">
                <p className="text-[10px] font-bold text-black/20 uppercase tracking-[0.2em]">Secured by UPI</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}} />
    </div>
  );
}
