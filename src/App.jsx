import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Lock, Eye, EyeOff, Copy, Check, AlertTriangle, Zap, RotateCcw,
} from 'lucide-react';
import './App.css';

const App = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    noCommonPatterns: false,
  });
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'strength-weak' });
  const [generatorConfig, setGeneratorConfig] = useState({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
    excludeAmbiguous: false,
  });

  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
   
