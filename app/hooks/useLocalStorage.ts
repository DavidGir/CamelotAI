import { useEffect, useState } from "react";

export default function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [savedValue, setSavedValue] = useState<T>(initialValue);

  useEffect(() => {
    const item = localStorage.getItem(key);
    if (item) setSavedValue(JSON.parse(item));
  }, [key]);

  const updateValue = (value: T | ((val: T) => T)) => {
    const newValue = typeof value === 'function' ? (value as (val: T) => T)(savedValue) : value;
    setSavedValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [savedValue, updateValue];
};