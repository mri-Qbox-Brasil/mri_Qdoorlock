import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { fetchNui } from '../utils/fetchNui';
import { useNuiEvent } from '../hooks/useNuiEvent';
import NumericKeypad from './NumericKeypad';

const PasscodePrompt: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [passcodeType, setPasscodeType] = useState('text');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useNuiEvent('openPasscodePrompt', (data?: { passcodeType?: string }) => {
    setVisible(true);
    setPasscode('');
    setShowPassword(false);
    setPasscodeType(data?.passcodeType || 'text');
    // Need a slight delay to focus because the element might not be rendered yet
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  });

  // Handle ESC directly here just in case, but usually useExitListener handles it.
  // Wait, useExitListener might not close this if we don't hook it up, but the Lua callback 'exit'
  // will cancel the promise anyway. We just need to hide this prompt.
  useNuiEvent('exit', () => {
    setVisible(false);
    setPasscode('');
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    
    fetchNui('submitPasscode', passcode.trim());
    setVisible(false);
    setPasscode('');
  };

  const handleCancel = () => {
    fetchNui('submitPasscode', null);
    setVisible(false);
    setPasscode('');
  };

  const handleNumericSubmit = (code: string) => {
    fetchNui('submitPasscode', code);
    setVisible(false);
    setPasscode('');
  };

  // Allow ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (visible && e.key === 'Escape') {
        e.stopPropagation();
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [visible]);

  if (!visible) return null;

  if (passcodeType === 'numeric') {
    return <NumericKeypad visible={visible} onCancel={handleCancel} onSubmit={handleNumericSubmit} />;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent animate-in fade-in duration-200">
      <div className="w-80 bg-card border border-border/60 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <Lock size={20} />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Fechadura</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Esta porta requer uma senha para ser acessada.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-xs font-medium text-foreground mb-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={14} className="text-muted-foreground" />
              </div>
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-9 pr-10 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                placeholder="Digite a senha..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
              onClick={handleCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasscodePrompt;
