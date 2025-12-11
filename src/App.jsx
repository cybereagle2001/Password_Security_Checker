import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Eye, EyeOff, Copy, Check, AlertTriangle, Zap, RotateCcw } from 'lucide-react';
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
    noCommonPatterns: false
  });
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'strength-weak' });
  const [generatorConfig, setGeneratorConfig] = useState({
    length: 12,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
    excludeAmbiguous: false
  });

  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];
  const commonPatterns = [/123/, /abc/, /qwe/, /asd/, /zxc/, /!@#/, /@#$/];

  const calculateStrength = useCallback((pwd) => {
    if (!pwd) return { score: 0, label: "Empty", color: "strength-weak" };
    
    let score = 0;

    if (pwd.length >= 8) score += 2;
    if (pwd.length >= 10) score += 2;
    if (pwd.length >= 12) score += 2;
    if (pwd.length >= 14) score += 2;

    if (/[A-Z]/.test(pwd)) score += 2;
    if (/[a-z]/.test(pwd)) score += 2;
    if (/[0-9]/.test(pwd)) score += 2;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 2;

    const isCommon = commonPasswords.includes(pwd.toLowerCase()) ||
                     commonPatterns.some(pattern => pattern.test(pwd));

    if (!isCommon) score += 2;

    const finalScore = Math.min(10, Math.floor(score / 2));

    let label = "Weak";
    let color = "strength-weak";

    if (finalScore <= 3) { label = "Weak"; color = "strength-weak"; }
    else if (finalScore <= 6) { label = "Fair"; color = "strength-fair"; }
    else if (finalScore <= 8) { label = "Good"; color = "strength-good"; }
    else { label = "Strong"; color = "strength-strong"; }

    return { score: finalScore, label, color };
  }, []);

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

  useEffect(() => {
    setStrength(calculateStrength(password));
    updateCriteria(password);
  }, [password, calculateStrength, updateCriteria]);

  const generatePassword = useCallback(() => {
    const { length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous } = generatorConfig;

    let charset = '';
    if (includeLowercase) charset += 'abcdefghjkmnpqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHJKMNPQRSTUVWXYZ';
    if (includeNumbers) charset += '23456789';

    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (excludeAmbiguous) symbols = symbols.replace(/[{}|;:,.<>?]/g, '');

    if (includeSymbols) charset += symbols;

    let pwd = '';
    const requiredSets = [];

    if (includeLowercase) requiredSets.push('abcdefghjkmnpqrstuvwxyz');
    if (includeUppercase) requiredSets.push('ABCDEFGHJKMNPQRSTUVWXYZ');
    if (includeNumbers) requiredSets.push('23456789');
    if (includeSymbols) requiredSets.push(symbols);

    requiredSets.forEach(set => {
      pwd += set.charAt(Math.floor(Math.random() * set.length));
    });

    for (let i = pwd.length; i < length; i++) {
      pwd += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    pwd = pwd.split('').sort(() => 0.5 - Math.random()).join('');

    setGeneratedPassword(pwd);
    setPassword(pwd);
  }, [generatorConfig]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword || password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <>
      {/* Header */}
      <header>
        <div className="container" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
            <div style={{background:"#2563eb",padding:"8px",borderRadius:"10px"}}>
              <Lock color="white" size={24} />
            </div>
            <h1>pass.<span>imedrasphere</span></h1>
          </div>
          <div style={{color:"#6b7280"}}>Your trusted password security companion</div>
        </div>
      </header>

      {/* Main */}
      <main className="container">
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <h2 style={{fontSize:"2.2rem",fontWeight:"bold"}}>Password Security Checker & Generator</h2>
          <p style={{fontSize:"1.2rem",color:"#6b7280",marginTop:"10px"}}>
            Analyze your password strength and generate secure, random passwords.
          </p>
        </div>

        <div className="responsive-grid">
          
          {/* Password Checker */}
          <div className="card">
            <h3 style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <Shield color="#2563eb" />
              Password Checker
            </h3>

            <div style={{marginTop:"20px"}}>
              <label>Password</label>
              <div style={{position:"relative"}}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                />
                <button
                  onClick={()=>setShowPassword(!showPassword)}
                  style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer"}}
                >
                  {showPassword ? <EyeOff size={20} color="#6b7280"/> : <Eye size={20} color="#6b7280"/>}
                </button>
              </div>
            </div>

            {/* Strength meter */}
            <div style={{marginTop:"20px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                <span>Password Strength</span>
                <span>{strength.label} ({strength.score}/10)</span>
              </div>

              <div className="strength-bar">
                <div
                  className={`strength-fill ${strength.color}`}
                  style={{ width: `${strength.score * 10}%` }}
                ></div>
              </div>
            </div>

            {/* Requirements */}
            <ul className="checklist" style={{marginTop:"20px"}}>
              {[
                { label: "At least 8 characters", pass: passwordCriteria.minLength },
                { label: "Contains uppercase letters", pass: passwordCriteria.hasUppercase },
                { label: "Contains lowercase letters", pass: passwordCriteria.hasLowercase },
                { label: "Contains numbers", pass: passwordCriteria.hasNumber },
                { label: "Contains special characters", pass: passwordCriteria.hasSpecialChar },
                { label: "Avoids common patterns", pass: passwordCriteria.noCommonPatterns }
              ].map((item, i)=>(
                <li key={i} className={item.pass ? "pass" : "fail"}>
                  {item.pass ? <Check size={16} /> : <AlertTriangle size={16}/>}
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Generator */}
          <div className="card">
            <h3 style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <Zap color="#16a34a" />
              Password Generator
            </h3>

            <div style={{marginTop:"20px"}}>
              <label>Generated Password</label>
              <div style={{position:"relative"}}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={generatedPassword || password}
                  readOnly
                />
                <button
                  className="btn-gray"
                  onClick={copyToClipboard}
                  style={{position:"absolute",right:"50px",top:"50%",transform:"translateY(-50%)"}}
                >
                  {copied ? <Check color="green"/> : <Copy />}
                </button>
                <button
                  style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none"}}
                  onClick={()=>setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            <div style={{marginTop:"20px"}}>
              <label>Password Length: {generatorConfig.length}</label>
              <input
                type="range"
                min="8"
                max="32"
                value={generatorConfig.length}
                onChange={(e)=>setGeneratorConfig({...generatorConfig, length:parseInt(e.target.value)})}
                style={{width:"100%"}}
              />
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"20px"}}>
              {[
                { key: 'includeUppercase', label: 'Uppercase (A-Z)' },
                { key: 'includeLowercase', label: 'Lowercase (a-z)' },
                { key: 'includeNumbers', label: 'Numbers (0-9)' },
                { key: 'includeSymbols', label: 'Symbols (!@#$%)' },
                { key: 'excludeSimilar', label: 'Exclude similar (i, l, 1, O, 0)' },
                { key: 'excludeAmbiguous', label: 'Exclude ambiguous chars' },
              ].map(option => (
                <label key={option.key} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <input
                    type="checkbox"
                    checked={generatorConfig[option.key]}
                    onChange={(e)=>setGeneratorConfig({...generatorConfig, [option.key]:e.target.checked})}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <div style={{display:"flex",gap:"10px",marginTop:"20px"}}>
              <button className="btn btn-primary" onClick={generatePassword}>
                <Zap size={18} style={{marginRight:"5px"}}/> Generate
              </button>
              <button className="btn btn-gray" onClick={()=>setPassword("")}>
                <RotateCcw size={18}/>
              </button>
            </div>
          </div>

        </div>

        {/* Tips */}
        <div className="card" style={{marginTop:"30px"}}>
          <h3>Password Security Best Practices</h3>

          <div className="tips-grid" style={{marginTop:"20px"}}>
            {[
              {
                title: "Use Unique Passwords",
                description: "Never reuse passwords across accounts.",
                icon: <Lock color="#2563eb" />
              },
              {
                title: "Enable 2FA",
                description: "Add an extra layer of security.",
                icon: <Shield color="#16a34a" />
              },
              {
                title: "Use a Password Manager",
                description: "Store passwords securely.",
                icon: <Zap color="#8b5cf6" />
              },
            ].map((tip, i)=>(
              <div key={i} className="card" style={{padding:"15px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  {tip.icon}
                  <h4>{tip.title}</h4>
                </div>
                <p style={{color:"#6b7280",fontSize:"0.9rem",marginTop:"5px"}}>{tip.description}</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer>
        <p>
          <Lock size={18}/> pass.<span>imedrasphere</span>.com — Secure your digital life
        </p>
        <small style={{color:"#9ca3af"}}>
          © {new Date().getFullYear()} IMEDRASphere. All rights reserved.
        </small>
      </footer>
    </>
  );
};

export default App;
