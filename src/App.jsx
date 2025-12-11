import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Eye, EyeOff, Copy, Check, AlertTriangle, Zap, RotateCcw } from 'lucide-react';

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
    noCommonPatterns: false
  });
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'bg-red-500' });
  const [generatorConfig, setGeneratorConfig] = useState({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
    excludeAmbiguous: false
  });

  // Common passwords and patterns to avoid
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];
  const commonPatterns = [
    /123/, /abc/, /qwe/, /asd/, /zxc/, /!@#/, /@#$/
  ];

  // Calculate password strength
  const calculateStrength = useCallback((pwd) => {
    if (!pwd) {
      return { score: 0, label: 'Empty', color: 'bg-gray-300' };
    }

    let score = 0;
    let criteriaMet = 0;

    // Length check (max 8 points)
    if (pwd.length >= 8) score += 2;
    if (pwd.length >= 10) score += 2;
    if (pwd.length >= 12) score += 2;
    if (pwd.length >= 14) score += 2;

    // Character variety (max 8 points)
    if (/[A-Z]/.test(pwd)) { score += 2; criteriaMet++; }
    if (/[a-z]/.test(pwd)) { score += 2; criteriaMet++; }
    if (/[0-9]/.test(pwd)) { score += 2; criteriaMet++; }
    if (/[^A-Za-z0-9]/.test(pwd)) { score += 2; criteriaMet++; }

    // Check for common passwords and patterns
    const isCommon = commonPasswords.includes(pwd.toLowerCase()) || 
                    commonPatterns.some(pattern => pattern.test(pwd));
    if (!isCommon) score += 2;

    // Calculate final score (0-10)
    const finalScore = Math.min(10, Math.floor(score / 2));
    
    // Determine strength label and color
    let label, color;
    if (finalScore <= 3) {
      label = 'Weak';
      color = 'bg-red-500';
    } else if (finalScore <= 6) {
      label = 'Fair';
      color = 'bg-yellow-500';
    } else if (finalScore <= 8) {
      label = 'Good';
      color = 'bg-blue-500';
    } else {
      label = 'Strong';
      color = 'bg-green-500';
    }

    return { score: finalScore, label, color };
  }, []);

  // Update password criteria
  const updateCriteria = useCallback((pwd) => {
    setPasswordCriteria({
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[^A-Za-z0-9]/.test(pwd),
      noCommonPatterns: !commonPasswords.includes(pwd.toLowerCase()) && 
                        !commonPatterns.some(pattern => pattern.test(pwd))
    });
  }, []);

  // Handle password input
  useEffect(() => {
    const newStrength = calculateStrength(password);
    setStrength(newStrength);
    updateCriteria(password);
  }, [password, calculateStrength, updateCriteria]);

  // Generate secure password
  const generatePassword = useCallback(() => {
    const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous } = generatorConfig;
    
    let charset = '';
    if (includeLowercase) charset += 'abcdefghjkmnpqrstuvwxyz'; // exclude i, l, o for similarity
    if (includeUppercase) charset += 'ABCDEFGHJKMNPQRSTUVWXYZ'; // exclude I, O for similarity
    if (includeNumbers) charset += '23456789'; // exclude 0, 1 for similarity
    if (includeSymbols) {
      let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (excludeAmbiguous) symbols = symbols.replace(/[{}|;:,.<>?]/g, ''); // remove ambiguous symbols
      charset += symbols;
    }
    
    // Ensure at least one character from each selected type
    let password = '';
    const types = [];
    if (includeLowercase) types.push('abcdefghjkmnpqrstuvwxyz');
    if (includeUppercase) types.push('ABCDEFGHJKMNPQRSTUVWXYZ');
    if (includeNumbers) types.push('23456789');
    if (includeSymbols) {
      let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (excludeAmbiguous) symbols = symbols.replace(/[{}|;:,.<>?]/g, '');
      types.push(symbols);
    }
    
    // Add at least one character from each type
    types.forEach(type => {
      password += type.charAt(Math.floor(Math.random() * type.length));
    });
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setGeneratedPassword(password);
    setPassword(password);
  }, [generatorConfig]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword || password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password', err);
    }
  };

  // Reset all fields
  const resetAll = () => {
    setPassword('');
    setGeneratedPassword('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">pass.<span className="text-blue-600">imedrasphere</span></h1>
          </div>
          <div className="text-sm text-gray-500 hidden md:block">
            Your trusted password security companion
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Password Security Checker & Generator
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Analyze your password strength and generate secure, random passwords
              to protect your online accounts.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Password Checker */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Password Checker</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Password to Check
                  </label>
                  <div className="relative">
                    <input
                      id="password-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="Type your password here..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Strength Meter */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Password Strength</span>
                    <span className={`text-sm font-semibold ${strength.color === 'bg-red-500' ? 'text-red-600' : strength.color === 'bg-yellow-500' ? 'text-yellow-600' : strength.color === 'bg-blue-500' ? 'text-blue-600' : 'text-green-600'}`}>
                      {strength.label} ({strength.score}/10)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${strength.color} transition-all duration-500 ease-in-out`}
                      style={{ width: `${strength.score * 10}%` }}
                    ></div>
                  </div>
                </div>

                {/* Criteria Checklist */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Security Requirements</h4>
                  <ul className="space-y-2">
                    {[
                      { key: 'minLength', label: 'At least 8 characters', passed: passwordCriteria.minLength },
                      { key: 'hasUppercase', label: 'Contains uppercase letters', passed: passwordCriteria.hasUppercase },
                      { key: 'hasLowercase', label: 'Contains lowercase letters', passed: passwordCriteria.hasLowercase },
                      { key: 'hasNumber', label: 'Contains numbers', passed: passwordCriteria.hasNumber },
                      { key: 'hasSpecialChar', label: 'Contains special characters', passed: passwordCriteria.hasSpecialChar },
                      { key: 'noCommonPatterns', label: 'Avoids common patterns', passed: passwordCriteria.noCommonPatterns }
                    ].map((item) => (
                      <li key={item.key} className="flex items-center">
                        {item.passed ? (
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                        )}
                        <span className={item.passed ? "text-gray-700" : "text-gray-500"}>
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Password Generator */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <Zap className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Password Generator</h3>
                </div>
              </div>
              <div className="p-6">
                {/* Generated Password Display */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Generated Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={generatedPassword || password}
                      readOnly
                      className="w-full px-4 py-3 pr-16 bg-gray-50 border border-gray-300 rounded-lg font-mono"
                    />
                    <div className="absolute inset-y-0 right-0 flex">
                      <button
                        onClick={copyToClipboard}
                        className="px-3 flex items-center border-l border-gray-300 bg-white rounded-r-lg hover:bg-gray-50 transition"
                      >
                        {copied ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-3 flex items-center border-l border-gray-300 bg-white rounded-r-lg hover:bg-gray-50 transition"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generator Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password Length: {generatorConfig.length}
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={generatorConfig.length}
                      onChange={(e) => setGeneratorConfig({...generatorConfig, length: parseInt(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>8</span>
                      <span>32</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'includeUppercase', label: 'Uppercase (A-Z)' },
                      { key: 'includeLowercase', label: 'Lowercase (a-z)' },
                      { key: 'includeNumbers', label: 'Numbers (0-9)' },
                      { key: 'includeSymbols', label: 'Symbols (!@#$%)' },
                      { key: 'excludeSimilar', label: 'Exclude similar (i,l,1,O,0)' },
                      { key: 'excludeAmbiguous', label: 'Exclude ambiguous ({},[],)' }
                    ].map((option) => (
                      <label key={option.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={generatorConfig[option.key]}
                          onChange={(e) => setGeneratorConfig({...generatorConfig, [option.key]: e.target.checked})}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={generatePassword}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center"
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Generate Password
                    </button>
                    <button
                      onClick={resetAll}
                      className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Password Security Best Practices</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Use Unique Passwords",
                    description: "Never reuse passwords across different accounts. If one account is compromised, others remain safe.",
                    icon: <Lock className="h-6 w-6 text-blue-500" />
                  },
                  {
                    title: "Enable 2FA",
                    description: "Add an extra layer of security with two-factor authentication for your important accounts.",
                    icon: <Shield className="h-6 w-6 text-green-500" />
                  },
                  {
                    title: "Use a Password Manager",
                    description: "Store and manage your passwords securely with a reputable password manager.",
                    icon: <Zap className="h-6 w-6 text-purple-500" />
                  }
                ].map((tip, index) => (
                  <div key={index} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition">
                    <div className="flex items-center mb-3">
                      <div className="mr-3">{tip.icon}</div>
                      <h4 className="font-semibold text-gray-900">{tip.title}</h4>
                    </div>
                    <p className="text-gray-600 text-sm">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5 text-blue-400" />
                <span className="font-semibold">pass.<span className="text-blue-400">imedrasphere</span>.com</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Secure your digital life</p>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} IMEDRASphere. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

