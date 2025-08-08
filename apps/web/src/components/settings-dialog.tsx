import { useState } from "react";
import { Dialog } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTheme } from "./theme-provider";
import { Moon, Sun, Monitor, User, Mail, CreditCard } from "lucide-react";
import type { User as UserType } from "../types";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserType;
  onUserUpdate: (user: UserType) => void;
}

export function SettingsDialog({ open, onClose, user, onUserUpdate }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  
  const handleSave = () => {
    onUserUpdate({
      ...user,
      name,
      email,
    });
    onClose();
  };

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <Dialog open={open} onClose={onClose} title="Configurações">
      <div className="space-y-6">
        {/* Profile Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Perfil
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Nome</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu email"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Tema
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setTheme(option.id as 'light' | 'dark' | 'system')}
                className={`flex flex-col items-center space-y-2 p-3 rounded-lg border-2 transition-colors ${
                  theme === option.id
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <option.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Plan Info */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Plano Atual
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user.plan === 'pro' ? 'Pro' : 'Gratuito'}
              </span>
              {user.plan === 'pro' && (
                <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                  PRO
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {user.credits} de {user.maxCredits} créditos utilizados
            </div>
            {user.plan !== 'pro' && (
              <Button size="sm" className="mt-3 w-full">
                Fazer upgrade
              </Button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Salvar
          </Button>
        </div>
      </div>
    </Dialog>
  );
}