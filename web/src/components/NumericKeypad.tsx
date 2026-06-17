import React, { useState, useEffect } from 'react';
import { Lock, Check, Delete, Eye, EyeOff } from 'lucide-react';
import { fetchNui } from '../utils/fetchNui';

interface NumericKeypadProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (code: string) => void;
}

const NumericKeypad: React.FC<NumericKeypadProps> = ({ visible, onCancel, onSubmit }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Reset passcode when it becomes visible
  useEffect(() => {
    if (visible) {
      setPasscode('');
    }
  }, [visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;

      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      } else if (e.key === 'Backspace') {
        setPasscode((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        handleSubmit();
      } else if (/^[0-9]$/.test(e.key)) {
        if (passcode.length < 8) {
          setPasscode((prev) => prev + e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [visible, passcode]);

  const handleSubmit = () => {
    if (!passcode.trim()) return;
    onSubmit(passcode.trim());
    setPasscode('');
  };

  const handleKeyPress = (num: string) => {
    if (passcode.length < 8) {
      setPasscode((prev) => prev + num);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent animate-in fade-in duration-200">
      <div 
        className="relative bg-gradient-to-b from-[#2a2a2c] to-[#1a1a1c] border-4 border-[#121212] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        style={{
          width: '320px',
          height: '440px',
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 2px 5px rgba(255,255,255,0.05)'
        }}
      >
        <div className="flex flex-col items-center w-full h-full p-8 pt-12">
          
          {/* Lock Icon */}
          <div className="flex flex-col items-center mb-4">
            <Lock size={16} className="text-primary/80" />
          </div>

          {/* Little Screen for Password */}
          <div className="flex items-center justify-between bg-[#111] border-2 border-[#000] rounded-md w-full max-w-[220px] h-10 mb-6 shadow-inner px-3">
            <span className="text-white/80 font-mono text-lg tracking-widest overflow-hidden">
              {passcode.length > 0 ? (showPassword ? passcode : '*'.repeat(passcode.length)) : <span className="text-white/20 text-xs tracking-normal font-sans">Digite a senha</span>}
            </span>
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/40 hover:text-white/80 transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Keypad Grid */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-4 w-full px-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="flex items-center justify-center w-12 h-12 rounded-full text-white/80 text-2xl font-light hover:bg-white/10 hover:text-white active:bg-white/20 transition-colors focus:outline-none"
              >
                {num}
              </button>
            ))}

            {/* Bottom Row */}
            <button
              onClick={handleSubmit}
              className="flex items-center justify-center w-12 h-12 rounded-full text-primary hover:bg-primary/20 hover:text-primary-foreground transition-colors focus:outline-none"
            >
              <Check size={24} />
            </button>
            
            <button
              onClick={() => handleKeyPress('0')}
              className="flex items-center justify-center w-12 h-12 rounded-full text-white/80 text-2xl font-light hover:bg-white/10 hover:text-white active:bg-white/20 transition-colors focus:outline-none"
            >
              0
            </button>

            <button
              onClick={() => setPasscode((prev) => prev.slice(0, -1))}
              className="flex items-center justify-center w-12 h-12 rounded-full text-white/40 hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
            >
              <Delete size={20} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NumericKeypad;
