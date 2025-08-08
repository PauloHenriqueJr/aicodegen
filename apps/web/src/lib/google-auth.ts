import type { User } from '../types';

// Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            // FedCM migration flags
            use_fedcm_for_prompt?: boolean;
            use_fedcm_for_button?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, config: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            type?: 'standard' | 'icon';
            text?: 'signin_with' | 'signup_with' | 'continue_with';
            width?: string;
          }) => void;
          prompt: (callback?: (n: unknown) => void) => void;
          disableAutoSelect: () => void;
          cancel: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

// Google OAuth configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 
                        import.meta.env.VITE_GOOGLE_CLIENT_ID_PROD || 
                        '207876045519-7trlg013advn4qqks8vlsp2nqbghap8d.apps.googleusercontent.com';

console.log('🔧 Google Auth Debug:', {
  'import.meta.env.VITE_GOOGLE_CLIENT_ID': import.meta.env.VITE_GOOGLE_CLIENT_ID,
  'import.meta.env.MODE': import.meta.env.MODE,
  'import.meta.env.PROD': import.meta.env.PROD,
  'GOOGLE_CLIENT_ID (final)': GOOGLE_CLIENT_ID
});

export class GoogleAuthService {
  private static isInitialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.accounts) {
        this.isInitialized = true;
        resolve();
        return;
      }

      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Wait a bit for the API to be fully available
        setTimeout(() => {
          if (window.google && window.google.accounts) {
            this.isInitialized = true;
            console.log('Google Identity Services carregado com sucesso');
            resolve();
          } else {
            reject(new Error('Google Identity Services não pôde ser inicializado'));
          }
        }, 100);
      };

      script.onerror = () => {
        console.error('Erro ao carregar Google Identity Services');
        reject(new Error('Falha ao carregar Google Identity Services'));
      };

      document.head.appendChild(script);
    });

    return this.initPromise;
  }

  static async signIn(): Promise<{ credential: string }> {
    try {
      await this.initialize();
      
      if (!GOOGLE_CLIENT_ID || 
          GOOGLE_CLIENT_ID === 'your-google-client-id' || 
          GOOGLE_CLIENT_ID.length < 10) {
        console.error('❌ Google Client ID inválido:', GOOGLE_CLIENT_ID);
        throw new Error('Google Client ID não configurado. Verifique a variável VITE_GOOGLE_CLIENT_ID no arquivo .env');
      }

      console.log('✅ Usando Google Client ID:', GOOGLE_CLIENT_ID);

      console.log('Iniciando login com Google...');
      console.log('Client ID:', GOOGLE_CLIENT_ID);
      console.log('Origem atual:', window.location.origin);

      // Clear any existing tokens to force fresh authentication
      try {
        if (window.google?.accounts?.id?.disableAutoSelect) {
          window.google.accounts.id.disableAutoSelect();
        }
      } catch (e) {
        console.log('Não foi possível limpar tokens existentes:', e);
      }

      return new Promise((resolve, reject) => {
        let isResolved = false;
        
        const cleanup = (container?: HTMLElement) => {
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
          }
        };

        const handleSuccess = (response: { credential: string }) => {
          if (isResolved) return;
          isResolved = true;
          console.log('Login bem-sucedido!');
          resolve(response);
        };

        const handleError = (error: Error) => {
          if (isResolved) return;
          isResolved = true;
          console.error('Erro no login:', error);
          reject(error);
        };

        try {
          // Initialize Google Identity Services with basic configuration
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleSuccess,
            auto_select: false,
            cancel_on_tap_outside: true,
            // Disable FedCM for now to avoid origin issues
            // use_fedcm_for_prompt: false,
            // use_fedcm_for_button: false,
          });

          // Disable auto select to force fresh authentication
          if (window.google.accounts.id.disableAutoSelect) {
            window.google.accounts.id.disableAutoSelect();
          }

          // Try One Tap first
          try {
            console.log('Tentando One Tap...');
            window.google.accounts.id.prompt((notification: any) => {
              console.log('One Tap notification:', notification);
              
              if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log('One Tap foi pulado, tentando botão...');
                this.tryButtonFlow(handleSuccess, handleError, cleanup);
              }
            });
            
            // Fallback to button after 3 seconds if One Tap doesn't work
            setTimeout(() => {
              if (!isResolved) {
                console.log('One Tap timeout, tentando botão...');
                this.tryButtonFlow(handleSuccess, handleError, cleanup);
              }
            }, 3000);
            
          } catch (promptError) {
            console.warn('One Tap falhou:', promptError);
            this.tryButtonFlow(handleSuccess, handleError, cleanup);
          }
          
        } catch (initError) {
          console.error('Erro na inicialização:', initError);
          handleError(initError as Error);
        }
      });
    } catch (error) {
      console.error('Erro geral no signIn:', error);
      throw error;
    }
  }

  private static tryButtonFlow(
    onSuccess: (response: { credential: string }) => void,
    onError: (error: Error) => void,
    cleanup: (container?: HTMLElement) => void
  ) {
    try {
      // Create a temporary container for the button
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.visibility = 'hidden';
      document.body.appendChild(tempDiv);

      // Re-initialize for button
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: onSuccess,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      console.log('Renderizando botão de login...');
      
      // Render the button
      window.google.accounts.id.renderButton(tempDiv, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        width: '100%'
      });

      // Simulate button click
      setTimeout(() => {
        const btn = tempDiv.querySelector('[role="button"]') as HTMLElement | null;
        if (btn) {
          console.log('Clicando no botão automaticamente...');
          btn.click();
        } else {
          console.error('Botão não encontrado');
          cleanup(tempDiv);
          onError(new Error('Não foi possível renderizar o botão do Google'));
        }
        
        // Cleanup after delay
        setTimeout(() => cleanup(tempDiv), 5000);
      }, 500);
      
    } catch (err) {
      console.error('Erro no fluxo do botão:', err);
      onError(err as Error);
    }
  }

  static async renderButton(element: HTMLElement, config?: {
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    type?: 'standard' | 'icon';
    text?: 'signin_with' | 'signup_with' | 'continue_with';
    width?: string;
  }): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          // This callback will be handled by the button click
          const event = new CustomEvent('google-signin', { detail: response });
          element.dispatchEvent(event);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        // Temporarily disable FedCM until origins are configured
        // use_fedcm_for_prompt: true,
        // use_fedcm_for_button: true,
      });      try {
        window.google.accounts.id.renderButton(element, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'continue_with',
          width: '100%',
          ...config,
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  static async verifyToken(credential: string): Promise<User> {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify Google token');
    }

    const data = await response.json();
    return data.data.user;
  }

  static decodeJWT(token: string) {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }
}