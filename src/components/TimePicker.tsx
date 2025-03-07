import { motion } from 'framer-motion';

interface TimePickerProps {
  value: number;
  onChange: (value: number) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const hours = [1, 2, 3, 4, 5];

  return (
    <div className="space-y-2">
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Selecione as horas
      </p>
      <div className="flex justify-center space-x-2">
        {hours.map((hour) => (
          <motion.button
            key={hour}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(hour)}
            className={`h-12 w-12 rounded-full text-lg font-semibold transition-colors ${
              value === hour
                ? 'bg-blue-500 text-white dark:bg-blue-400'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            {hour}
          </motion.button>
        ))}
      </div>
    </div>
  );
}