/**
 * Premium Alert Utility
 * Provides a simple API for showing premium-styled alerts
 */

import React from 'react';
import { PremiumAlert } from '../components/PremiumAlert';

type AlertRefType = {
  show: (title: string, message: string, type?: 'error' | 'success' | 'info') => void;
} | null;

let alertRef: AlertRefType = null;

export const setAlertRef = (ref: AlertRefType) => {
  alertRef = ref;
};

export const showAlert = (
  title: string,
  message: string,
  type: 'error' | 'success' | 'info' = 'error'
) => {
  if (alertRef) {
    alertRef.show(title, message, type);
  }
};

/**
 * Alert Manager Component
 * Must be rendered at the root level to show alerts
 */
export const AlertManager: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState<'error' | 'success' | 'info'>('error');

  React.useEffect(() => {
    setAlertRef({
      show: (alertTitle: string, alertMessage: string, alertType = 'error') => {
        setTitle(alertTitle);
        setMessage(alertMessage);
        setType(alertType);
        setVisible(true);
      },
    });
  }, []);

  return (
    <PremiumAlert
      visible={visible}
      title={title}
      message={message}
      type={type}
      onClose={() => setVisible(false)}
    />
  );
};

