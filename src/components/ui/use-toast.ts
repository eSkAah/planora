import * as React from 'react';

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
};

type Toast = ToasterToast;

type ToastState = {
  toasts: Toast[];
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 500;

type ActionType =
  | {
      type: 'ADD_TOAST';
      toast: Toast;
    }
  | {
      type: 'UPDATE_TOAST';
      toast: Partial<Toast> & { id: string };
    }
  | {
      type: 'DISMISS_TOAST';
      toastId?: Toast['id'];
    }
  | {
      type: 'REMOVE_TOAST';
      toastId?: Toast['id'];
    };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const toastReducer = (state: ToastState, action: ActionType): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach(toast => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map(toast =>
          toast.id === toastId || toastId === undefined
            ? { ...toast, duration: 0 }
            : toast
        ),
      };
    }

    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: ToastState) => void> = [];

let memoryState: ToastState = { toasts: [] };

const dispatch = (action: ActionType) => {
  memoryState = toastReducer(memoryState, action);
  listeners.forEach(listener => {
    listener(memoryState);
  });
};

type ToastProps = Omit<ToasterToast, 'id'> & { id?: string };

function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast: ({ duration = 4000, id: customId, ...props }: ToastProps) => {
      const id = customId ?? `toast-${Math.random().toString(36).slice(2, 10)}`;

      const update = (toastProps: Partial<Omit<Toast, 'id'>>) =>
        dispatch({
          type: 'UPDATE_TOAST',
          toast: { id, ...toastProps },
        });

      const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });

      dispatch({
        type: 'ADD_TOAST',
        toast: {
          ...props,
          duration,
          id,
        },
      });

      return {
        id,
        dismiss,
        update,
      };
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        dispatch({ type: 'DISMISS_TOAST', toastId });
      } else {
        dispatch({ type: 'DISMISS_TOAST' });
      }
    },
  };
}

export type { Toast };
export { useToast };
