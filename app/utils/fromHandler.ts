import { Dispatch, SetStateAction } from 'react';

export const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setTarget: Dispatch<SetStateAction<number | "">> 
) => {
  const value = e.target.value;

  if (value === "") {
    setTarget(""); // Ahora TS sabe que esto es una función válida
    return;
  }

  const num = parseFloat(value);
  if (!isNaN(num)) {
    setTarget(num);
  }
};