interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function Alert({ message, type }: AlertProps) {
  const styles = {
    success: 'bg-green-50 text-green-700 border border-green-200',
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  return (
    <div className={`rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}
