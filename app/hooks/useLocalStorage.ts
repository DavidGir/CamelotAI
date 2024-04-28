import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T | undefined): [T | undefined, (value: T | undefined | ((val: T | undefined) => T | undefined)) => void] {
    const [storedValue, setStoredValue] = useState<T | undefined>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading from localStorage', error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            if (storedValue === undefined) {
                window.localStorage.removeItem(key); 
            } else {
                window.localStorage.setItem(key, JSON.stringify(storedValue));
            }
        } catch (error) {
            console.error('Error writing to localStorage', error);
        }
    }, [storedValue, key]);

    return [storedValue, setStoredValue];
}

export default useLocalStorage;
