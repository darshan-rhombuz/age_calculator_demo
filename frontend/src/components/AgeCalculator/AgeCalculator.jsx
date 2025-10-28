import React, { useState, useRef, useEffect, useCallback } from 'react';
import { calculateAgeAPI } from '../../services/ageService';
import Calendar from '../Calendar/Calendar';
import ResultDisplay from '../ResultDisplay/ResultDisplay';
import DateInput from '../DateInput/DateInput';
import {
  CalculatorContainer,
  CalculatorTitle,
  AgeForm,
  FormLabel,
  SubmitBtn,
  ErrorMessage
} from './AgeCalculator.sc';

const AgeCalculator = () => {
  const [birthdate, setBirthdate] = useState('');
  const [age, setAge] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [rawInput, setRawInput] = useState('');
  const inputRef = useRef(null);
  const calendarRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

    const formatSlashInput = (value) => {
    const parts = value.split('/');
    if (parts.length !== 3) return value;

    const [year, month, day] = parts;
    const paddedYear = year.padStart(4, '0');
    const paddedMonth = month.padStart(2, '0');
    const paddedDay = day.padStart(2, '0');

    return `${paddedYear}/${paddedMonth}/${paddedDay}`;
  };

  const formatDigitsInput = (digitsOnly) => {
    if (digitsOnly.length === 8) {
      const year = digitsOnly.substring(0, 4);
      const month = digitsOnly.substring(4, 6);
      const day = digitsOnly.substring(6, 8);
      return `${year}/${month}/${day}`;
    }

    let formatted = '';
    if (digitsOnly.length >= 1) formatted = digitsOnly.substring(0, 4);
    if (digitsOnly.length >= 5) formatted += '/' + digitsOnly.substring(4, 6);
    if (digitsOnly.length >= 7) formatted += '/' + digitsOnly.substring(6, 8);
    return formatted;
  };

  const formatDateInput = (value) => {
    if (value.includes('/')) {
      return formatSlashInput(value);
    }

    const digitsOnly = value.replaceAll(/\D/g, '');
    return formatDigitsInput(digitsOnly);
  };


  const debouncedFormatInput = useCallback((value) => {
    const formatted = formatDateInput(value);
    setBirthdate(formatted);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setRawInput(value);
    
    if (error) setError(null);
    if (age) setAge(null);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      debouncedFormatInput(value);
      setRawInput(''); 
    }, 500);
  };

  // Check for YYYY/MM/DD
  const isFormValid = () => {
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
    return dateRegex.test(birthdate);
  };

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  const handleDateSelect = (day, month, year) => {
    const formattedDate = `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;

    setBirthdate(formattedDate);
    setRawInput(formattedDate);
    setSelectedDate(new Date(year, month - 1, day));
    setShowCalendar(false);
    
    if (error) setError(null);
    if (age) setAge(null);
  };

  const handleMonthChange = (e) => {
    const month = Number.parseInt(e.target.value, 10);
    setCurrentDate(prev => new Date(prev.getFullYear(), month, 1));
  };

  const handleYearChange = (e) => {
    const year = Number.parseInt(e.target.value, 10);
    setCurrentDate(prev => new Date(year, prev.getMonth(), 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError('Please enter a complete date in DD/MM/YYYY format.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setAge(null);
    
    try {
      // const formattedDob = birthdate.replaceAll('/', '-');
      const result = await calculateAgeAPI(birthdate);

      setAge(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CalculatorContainer>
      <CalculatorTitle>Age Calculator</CalculatorTitle>
      
      <AgeForm onSubmit={handleSubmit}>
        <FormLabel htmlFor="birthdate">
          Enter your birthdate
        </FormLabel>
        
        <div style={{ position: 'relative' }} ref={calendarRef}>
          <DateInput
            value={rawInput || birthdate}
            onChange={handleInputChange}
            onCalendarToggle={handleCalendarToggle}
            inputRef={inputRef}
          />
          
          {showCalendar && (
            <Calendar
              currentDate={currentDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onMonthChange={handleMonthChange}
              onYearChange={handleYearChange}
              onClose={() => setShowCalendar(false)}
            />
          )}
        </div>
        
        <SubmitBtn
          type="submit"
          disabled={isLoading || !isFormValid()}
        >
          {isLoading ? 'CALCULATING...' : 'CALCULATE AGE'}
        </SubmitBtn>
      </AgeForm>
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      
      <ResultDisplay age={age} />
    </CalculatorContainer>
  );
};

export default AgeCalculator;