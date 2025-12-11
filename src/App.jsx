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
    'admin', 'letmein', 'welcome', 'monkey', '1234567890',
  ];
  const commonPatterns = [/123/, /abc/, /qwe/, /asd/, /zxc/, /!@#/, /@#$/];

  const calculateStrength = useCallback((pwd) => {
    if (!pwd) return { score: 0, label: 'Empty', color: 'strength-weak' };

    let score = 0;

    // Length
    if (pwd.length >= 8) score += 2;
    if (pwd.length >= 10) score += 2;
    if (pwd.length >= 12) score += 2;
    if (pwd.length >= 14) score += 2;

    // Diversity
    if (/[A-Z]/.test(pwd)) score += 2;
    if (/[a-z]/.test(pwd)) score += 2;
    if (/[0-9]/.test(pwd)) score += 2;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 2;

    // Common patterns
    const isCommon = commonPasswords.includes(pwd.toLowerCase()) ||
                     commonPatterns.some((pattern) => pattern.test(pwd));
    if (!isCommon) score += 2;

    const finalScore = Math.min(10, Math.floor(score / 2));

    let label, color;
    if (finalScore <= 3) {
      label = 'Weak';
      color = 'strength-weak';
    } else if (finalScore <= 6) {
      label = 'Fair';
      color = 'strength-fair';
    } else if (finalScore <= 8) {
      label = 'Good';
      color = 'strength-good';
    } else {
      label = 'Strong';
      color = 'strength-strong';
    }

    return { score: finalScore, label, color };
  }, []);

  const updateCriteria = useCallback((pwd) => {
    setPasswordCriteria({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[^A-Za-z0-9]/.test(pwd),
      noCommonPatterns:
        !commonPasswords.includes(pwd.toLowerCase()) &&
        !commonPatterns.some((pattern) => pattern.test(pwd)),
    });
  }, []);

  useEffect(() => {
    setStrength(calculateStrength(password));
    updateCriteria(password);
  }, [password, calculateStrength, updateCriteria]);

  const generatePassword = useCallback(() => {
    const {
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      excludeSimilar,
      excludeAmbiguous,
    } = generatorConfig;

    let charset = '';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const upper = 'ABCDEFGHJKMNPQRSTUVWXYZ';
    const nums = '23456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeAmbiguous) {
      symbols = symbols.replace(/[{}|;:,.<>?]/g, '');
    }

    if (includeLowercase) charset += lower;
    if (includeUppercase) charset += upper;
    if (includeNumbers) charset += nums;
    if (includeSymbols) charset += symbols;

    // Build required chars
    let pwd = '';
    const required = [];
    if (includeLowercase) required.push(lower);
    if (includeUppercase) required.push(upper);
    if (includeNumbers) required.push(nums);
    if (includeSymbols) required.push(symbols);

    required.forEach((set) => {
      pwd += set.charAt(Math.floor(Math.random() * set.length));
    });

    // Fill remaining
    for (let i = pwd.length; i < length; i++) {
      pwd += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle
    pwd = pwd
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');

    setGeneratedPassword(pwd);
    setPassword(pwd);
  }, [generatorConfig]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword || password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const resetAll = () => {
    setPassword('');
    setGeneratedPassword('');
    setCopied(false);
  };

  return (
    <>
      {/* Header */}
      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <Lock color="white" size={24} />
              </div>
              <h1>pass.<span>imedrasphere</span></h1>
            </div>
            <div className="tagline">Your trusted password security companion</div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container">
        <div className="hero">
          <h2>Password Security Checker & Generator</h2>
          <p>Analyze your password strength and generate secure, random passwords.</p>
        </div>

        <div className="responsive-grid">
          {/* Password Checker */}
          <div className="card">
            <h3 className="card-title">
              <Shield color="#2563eb" size={20} />
              Password Checker
            </h3>

            <div className="input-group">
              <label htmlFor="checker-password">Password</label>
              <div className="input-wrapper">
                <input
                  id="checker-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Type your password here..."
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
                </button>
              </div>
            </div>

            {/* Strength Meter */}
            <div className="input-group">
              <div className="strength-label">
                <span>Password Strength</span>
                <span className={`strength-label-score strength-${strength.color.split('-')[1]}`}>
                  {strength.label} ({strength.score}/10)
                </span>
              </div>
              <div className="strength-bar">
                <div
                  className={`strength-fill ${strength.color}`}
                  style={{ width: `${strength.score * 10}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist */}
            <ul className="checklist">
              {[
                { key: 'minLength', label: 'At least 8 characters', pass: passwordCriteria.minLength },
                { key: 'hasUppercase', label: 'Contains uppercase letters', pass: passwordCriteria.hasUppercase },
                { key: 'hasLowercase', label: 'Contains lowercase letters', pass: passwordCriteria.hasLowercase },
                { key: 'hasNumber', label: 'Contains numbers', pass: passwordCriteria.hasNumber },
                { key: 'hasSpecialChar', label: 'Contains special characters', pass: passwordCriteria.hasSpecialChar },
                { key: 'noCommonPatterns', label: 'Avoids common patterns', pass: passwordCriteria.noCommonPatterns },
              ].map((item) => (
                <li key={item.key} className={item.pass ? 'pass' : 'fail'}>
                  {item.pass ? <Check size={16} /> : <AlertTriangle size={16} />}
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Password Generator */}
          <div className="card">
            <h3 className="card-title">
              <Zap color="#16a34a" size={20} />
              Password Generator
            </h3>

            <div className="input-group">
              <label htmlFor="generated-password">Generated Password</label>
              <div className="input-wrapper">
                <input
                  id="generated-password"
                  type={showPassword ? 'text' : 'password'}
                  value={generatedPassword || password}
                  readOnly
                />
                <button
                  type="button"
                  className="copy-btn"
                  onClick={copyToClipboard}
                  aria-label="Copy to clipboard"
                >
                  {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Password Length: {generatorConfig.length}</label>
              <input
                type="range"
                min="8"
                max="32"
                value={generatorConfig.length}
                onChange={(e) => setGeneratorConfig({ ...generatorConfig, length: parseInt(e.target.value, 10) })}
              />
            </div>

            <div className="checkbox-grid">
              {[
                { key: 'includeUppercase', label: 'Uppercase (A-Z)' },
                { key: 'includeLowercase', label: 'Lowercase (a-z)' },
                { key: 'includeNumbers', label: 'Numbers (0-9)' },
                { key: 'includeSymbols', label: 'Symbols (!@#$%)' },
                { key: 'excludeSimilar', label: 'Exclude similar (i, l, 1, O, 0)' },
                { key: 'excludeAmbiguous', label: 'Exclude ambiguous chars' },
              ].map((option) => (
                <label key={option.key} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={generatorConfig[option.key]}
                    onChange={(e) => setGeneratorConfig({ ...generatorConfig, [option.key]: e.target.checked })}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>

            <div className="button-group">
              <button className="btn btn-primary" onClick={generatePassword}>
                <Zap size={18} />
                Generate Password
              </button>
              <button className="btn btn-gray" onClick={resetAll}>
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card tips-section">
          <h3>Password Security Best Practices</h3>
          <div className="tips-grid">
            {[
              {
                title: 'Use Unique Passwords',
                description: 'Never reuse passwords across accounts.',
                icon: <Lock color="#2563eb" size={20} />,
              },
              {
                title: 'Enable 2FA',
                description: 'Add an extra layer of security.',
                icon: <Shield color="#16a34a" size={20} />,
              },
              {
                title: 'Use a Password Manager',
                description: 'Store passwords securely.',
                icon: <Zap color="#8b5cf6" size={20} />,
              },
            ].map((tip, i) => (
              <div key={i} className="card tip-card">
                <div className="tip-header">
                  {tip.icon}
                  <h4>{tip.title}</h4>
                </div>
                <p>{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <div className="container">
          <p>
            <Lock size={18} /> pass.<span>imedrasphere</span>.com — Secure your digital life
          </p>
          <small>© {new Date().getFullYear()} IMEDRASphere. All rights reserved.</small>
        </div>
      </footer>
    </>
  );
};

export default App;
