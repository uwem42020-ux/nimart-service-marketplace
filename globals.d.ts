// globals.d.ts in project root
interface NimartGlobal {
    showLoading: (message?: string) => void;
    hideLoading: () => void;
    showError: (title: string, message?: string) => void;
    showSuccess: (title: string, message?: string) => void;
    showToast: (options: {
      title?: string;
      message: string;
      type?: 'info' | 'success' | 'error' | 'warning';
      duration?: number;
    }) => void;
  }
  
  declare global {
    interface Window {
      Nimart: NimartGlobal; // NO question mark here - NOT optional
    }
  }
  
  // This empty export makes it a module
  export {};