import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement } from 'chart.js';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Wallet, Home, Receipt, PieChart, Users, 
  Moon, Sun, Plus, TrendingDown, TrendingUp, 
  Trash2, UserPlus, X, Utensils, Car, ShoppingBag, 
  FileText, Music, Info, DollarSign, Gift, Briefcase,
  Target, BarChart2, Store, Landmark, CreditCard,
  Cloud, CloudRain, CloudLightning, CloudFog, MapPin,
  Activity, Radio
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ArcElement);

const CATEGORIES = {
    food: { icon: Utensils, color: '#f59e0b', label: 'Ăn uống' },
    transport: { icon: Car, color: '#3b82f6', label: 'Di chuyển' },
    shopping: { icon: ShoppingBag, color: '#ec4899', label: 'Mua sắm' },
    bills: { icon: FileText, color: '#ef4444', label: 'Hoá đơn' },
    entertainment: { icon: Music, color: '#8b5cf6', label: 'Giải trí' },
    other: { icon: Info, color: '#64748b', label: 'Khác' },
    salary: { icon: DollarSign, color: '#10b981', label: 'Tiền lương' },
    business: { icon: Store, color: '#f97316', label: 'Kinh doanh' },
    gift: { icon: Gift, color: '#14b8a6', label: 'Được tặng' },
    investment: { icon: Briefcase, color: '#6366f1', label: 'Đầu tư' },
    loan: { icon: Landmark, color: '#ef4444', label: 'Đi vay' },
    repayment: { icon: CreditCard, color: '#8b5cf6', label: 'Trả nợ' }
};

const VN_PROVINCES = [
  { name: 'An Giang', lat: 10.3711, lon: 105.4333 },
  { name: 'Bà Rịa - Vũng Tàu', lat: 10.4965, lon: 107.1683 },
  { name: 'Bạc Liêu', lat: 9.2941, lon: 105.7278 },
  { name: 'Bắc Giang', lat: 21.2731, lon: 106.1946 },
  { name: 'Bắc Kạn', lat: 22.147, lon: 105.8348 },
  { name: 'Bắc Ninh', lat: 21.1861, lon: 106.0763 },
  { name: 'Bến Tre', lat: 10.24, lon: 106.3753 },
  { name: 'Bình Dương', lat: 11.2323, lon: 106.656 },
  { name: 'Bình Định', lat: 14.1696, lon: 108.9048 },
  { name: 'Bình Phước', lat: 11.7513, lon: 106.9213 },
  { name: 'Bình Thuận', lat: 11.1042, lon: 108.2831 },
  { name: 'Cà Mau', lat: 9.1769, lon: 105.1501 },
  { name: 'Cao Bằng', lat: 22.6667, lon: 106.25 },
  { name: 'Cần Thơ', lat: 10.0452, lon: 105.7469 },
  { name: 'Đà Nẵng', lat: 16.0678, lon: 108.2208 },
  { name: 'Đắk Lắk', lat: 12.6667, lon: 108.05 },
  { name: 'Đắk Nông', lat: 12.2104, lon: 107.7297 },
  { name: 'Điện Biên', lat: 21.3861, lon: 103.0211 },
  { name: 'Đồng Nai', lat: 10.9458, lon: 107.0163 },
  { name: 'Đồng Tháp', lat: 10.4704, lon: 105.6791 },
  { name: 'Gia Lai', lat: 13.9833, lon: 108.2667 },
  { name: 'Hà Giang', lat: 22.8233, lon: 104.9831 },
  { name: 'Hà Nam', lat: 20.5317, lon: 105.9328 },
  { name: 'Hà Nội', lat: 21.0285, lon: 105.8542 },
  { name: 'Hà Tĩnh', lat: 18.3426, lon: 105.906 },
  { name: 'Hải Dương', lat: 20.9381, lon: 106.3151 },
  { name: 'Hải Phòng', lat: 20.8449, lon: 106.6881 },
  { name: 'Hậu Giang', lat: 9.7828, lon: 105.6315 },
  { name: 'Hòa Bình', lat: 20.8133, lon: 105.3383 },
  { name: 'Hưng Yên', lat: 20.6462, lon: 106.0511 },
  { name: 'Khánh Hòa', lat: 12.2451, lon: 109.1943 },
  { name: 'Kiên Giang', lat: 9.871, lon: 105.0805 },
  { name: 'Kon Tum', lat: 14.35, lon: 108.0 },
  { name: 'Lai Châu', lat: 22.3969, lon: 103.4542 },
  { name: 'Đà Lạt', lat: 11.9404, lon: 108.4583 },
  { name: 'Lạng Sơn', lat: 21.8475, lon: 106.7597 },
  { name: 'Lào Cai', lat: 22.4836, lon: 103.9705 },
  { name: 'Lâm Đồng', lat: 11.95, lon: 108.4333 },
  { name: 'Long An', lat: 10.5367, lon: 106.4069 },
  { name: 'Nam Định', lat: 20.4258, lon: 106.1683 },
  { name: 'Nghệ An', lat: 19.3333, lon: 104.8333 },
  { name: 'Ninh Bình', lat: 20.2539, lon: 105.975 },
  { name: 'Ninh Thuận', lat: 11.5667, lon: 108.9833 },
  { name: 'Phú Thọ', lat: 21.3289, lon: 105.2158 },
  { name: 'Phú Yên', lat: 13.0883, lon: 109.3217 },
  { name: 'Quảng Bình', lat: 17.4833, lon: 106.2167 },
  { name: 'Quảng Nam', lat: 15.5869, lon: 107.9899 },
  { name: 'Quảng Ngãi', lat: 15.1205, lon: 108.7923 },
  { name: 'Quảng Ninh', lat: 21.0108, lon: 107.2917 },
  { name: 'Quảng Trị', lat: 16.7497, lon: 107.1891 },
  { name: 'Sóc Trăng', lat: 9.601, lon: 105.9751 },
  { name: 'Sơn La', lat: 21.3253, lon: 103.8966 },
  { name: 'Tây Ninh', lat: 11.3667, lon: 106.1167 },
  { name: 'Thái Bình', lat: 20.4464, lon: 106.3314 },
  { name: 'Thái Nguyên', lat: 21.5936, lon: 105.845 },
  { name: 'Thanh Hóa', lat: 19.807, lon: 105.7766 },
  { name: 'TP Huế', lat: 16.4637, lon: 107.5905 },
  { name: 'Tiền Giang', lat: 10.4286, lon: 106.3155 },
  { name: 'TP.HCM', lat: 10.8231, lon: 106.6297 },
  { name: 'Trà Vinh', lat: 9.9213, lon: 106.3402 },
  { name: 'Tuyên Quang', lat: 21.8211, lon: 105.2131 },
  { name: 'Vĩnh Long', lat: 10.2522, lon: 105.9717 },
  { name: 'Vĩnh Phúc', lat: 21.3094, lon: 105.5986 },
  { name: 'Yên Bái', lat: 21.7145, lon: 104.8966 }
].sort((a,b) => a.name.localeCompare(b.name, 'vi'));

export default function App() {
  // === State ===
  const [theme, setTheme] = useState(() => localStorage.getItem('familyFi_theme') || 'light');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [incomeGoals, setIncomeGoals] = useState([]);
  const [members, setMembers] = useState([]);
  const [debts, setDebts] = useState([]);
  const [isFirebaseLoaded, setIsFirebaseLoaded] = useState(false);

  // Modals
  const [showTxModal, setShowTxModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);

  // Forms State
  const [txForm, setTxForm] = useState({ type: 'expense', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], memberId: 'all', note: '' });
  const [budgetForm, setBudgetForm] = useState({ category: 'food', amount: '' });
  const [incomeForm, setIncomeForm] = useState({ category: 'salary', amount: '' });
  const [memberForm, setMemberForm] = useState({ name: '', role: 'Vợ/Chồng' });
  const [debtForm, setDebtForm] = useState({ name: '', amount: '', monthlyPayment: '' });
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState(() => JSON.parse(localStorage.getItem('familyFi_weather_city')) || VN_PROVINCES.find(p => p.name === 'Hà Nội'));

  // === Effects ===
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('familyFi_theme', theme);
  }, [theme]);

  useEffect(() => {
    const unsubTx = onSnapshot(collection(db, 'transactions'), snap => setTransactions(snap.docs.map(d => ({id: d.id, ...d.data()})).sort((a,b) => new Date(b.date) - new Date(a.date))));
    const unsubBg = onSnapshot(collection(db, 'budgets'), snap => setBudgets(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubIg = onSnapshot(collection(db, 'incomeGoals'), snap => setIncomeGoals(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubMb = onSnapshot(collection(db, 'members'), snap => setMembers(snap.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubDb = onSnapshot(collection(db, 'debts'), snap => {
      setDebts(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setIsFirebaseLoaded(true);
    });
    return () => { unsubTx(); unsubBg(); unsubIg(); unsubMb(); unsubDb(); };
  }, []);

  useEffect(() => { localStorage.setItem('familyFi_weather_city', JSON.stringify(city)); }, [city]);

  useEffect(() => {
    if(isFirebaseLoaded && members.length === 0) {
      addDoc(collection(db, 'members'), { name: 'Gia đình Vinh (Mặc định)', role: 'Quản trị viên' });
    }
  }, [isFirebaseLoaded, members.length]);

  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&timezone=Asia%2FBangkok`)
      .then(res => res.json())
      .then(data => {
        if(data && data.current) setWeather(data.current);
      })
      .catch(e => console.error('Weather error:', e));
  }, [city]);

  const getWeatherInfo = (code) => {
    if(code === 0) return { label: 'Trời quang', icon: Sun, color: '#f59e0b' };
    if([1,2,3].includes(code)) return { label: 'Nhiều mây', icon: Cloud, color: '#94a3b8' };
    if([45,48].includes(code)) return { label: 'Sương mù', icon: CloudFog, color: '#cbd5e1' };
    if([51,53,55,61,63,65].includes(code)) return { label: 'Có mưa', icon: CloudRain, color: '#3b82f6' };
    if([71,73,75].includes(code)) return { label: 'Có tuyết (Lạnh)', icon: Cloud, color: '#cbd5e1' };
    if([95,96,99].includes(code)) return { label: 'Giông bão', icon: CloudLightning, color: '#eab308' };
    return { label: 'Thay đổi', icon: Cloud, color: '#94a3b8' };
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const formatCur = (amount) => amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' ₫';
  const formatInput = (amount) => amount ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '';
  const handleNumChange = (val, setter, field, prev) => setter({...prev, [field]: val.replace(/\D/g, '')});

  // === Derived Data ===
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let balance = 0, income = 0, expense = 0, totalRepaid = 0, totalBorrowed = 0;
  transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    if(tx.type === 'income') {
      balance += tx.amount;
      if(tx.category === 'loan') totalBorrowed += tx.amount;
      if(txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) income += tx.amount;
    } else {
      balance -= tx.amount;
      if(tx.category === 'repayment') totalRepaid += tx.amount;
      if(txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) expense += tx.amount;
    }
  });

  const totalBaseDebt = debts.reduce((sum, d) => sum + d.amount, 0);
  const currentTotalDebt = totalBaseDebt + totalBorrowed - totalRepaid;

  // Chart Data
  const chartLabels = [];
  const chartIncome = [0,0,0,0,0,0];
  const chartExpense = [0,0,0,0,0,0];
  
  for(let i=5; i>=0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    chartLabels.push(d.toLocaleDateString('vi-VN', { month: 'short' }));
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if(txDate.getMonth() === d.getMonth() && txDate.getFullYear() === d.getFullYear()) {
        if(tx.type === 'income') chartIncome[5-i] += tx.amount;
        else chartExpense[5-i] += tx.amount;
      }
    });
  }

  const style = getComputedStyle(document.body);
  const textColor = style.getPropertyValue('--text-secondary').trim() || '#64748b';

  const chartData = {
    labels: chartLabels,
    datasets: [
      { label: 'Thu', data: chartIncome, backgroundColor: 'rgba(16, 185, 129, 0.8)', borderRadius: 4 },
      { label: 'Chi', data: chartExpense, backgroundColor: 'rgba(239, 68, 68, 0.8)', borderRadius: 4 }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: textColor }, grid: { display: false } }
    }
  };

  // === Handlers ===
  const handleTxSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'transactions'), {
      ...txForm,
      amount: Number(txForm.amount),
      timestamp: Date.now()
    });
    setShowTxModal(false);
    setTxForm({ type: 'expense', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], memberId: 'all', note: '' });
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    const existing = budgets.find(b => b.category === budgetForm.category);
    if(existing) {
      await updateDoc(doc(db, 'budgets', existing.id), { amount: Number(budgetForm.amount) });
    } else {
      await addDoc(collection(db, 'budgets'), { category: budgetForm.category, amount: Number(budgetForm.amount) });
    }
    setShowBudgetModal(false);
  };

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    const existing = incomeGoals.find(g => g.category === incomeForm.category);
    if(existing) {
      await updateDoc(doc(db, 'incomeGoals', existing.id), { amount: Number(incomeForm.amount) });
    } else {
      await addDoc(collection(db, 'incomeGoals'), { category: incomeForm.category, amount: Number(incomeForm.amount) });
    }
    setShowIncomeModal(false);
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'members'), { name: memberForm.name, role: memberForm.role });
    setShowMemberModal(false);
    setMemberForm({ name: '', role: 'Vợ/Chồng' });
  };

  const handleDebtSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'debts'), { name: debtForm.name, amount: Number(debtForm.amount), monthlyPayment: Number(debtForm.monthlyPayment) });
    setShowDebtModal(false);
    setDebtForm({ name: '', amount: '', monthlyPayment: '' });
  };

  // === Sub-renders ===
  const renderDashboard = () => (
    <section className="view">
      <div className="overview-cards">
        <div className="card balance-card glass">
          <div className="card-icon"><Wallet /></div>
          <div className="card-details"><p>Tổng số dư</p><h2>{formatCur(balance)}</h2></div>
        </div>
        <div className="card income-card glass">
          <div className="card-icon"><TrendingUp /></div>
          <div className="card-details"><p>Tổng Thu (Tháng này)</p><h2 className="text-success">{formatCur(income)}</h2></div>
        </div>
        <div className="card expense-card glass">
          <div className="card-icon"><TrendingDown /></div>
          <div className="card-details"><p>Tổng Chi (Tháng này)</p><h2 className="text-danger">{formatCur(expense)}</h2></div>
        </div>
        <div className="card glass">
          <div className="card-icon" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}><Landmark /></div>
          <div className="card-details"><p>Tổng Dư Nợ</p><h2 className="text-danger">{formatCur(currentTotalDebt)}</h2></div>
        </div>
      </div>

      {/* Lifestyle Widgets */}
      <div className="lifestyle-widgets">
        <div className="widget-card widget-weather">
          <div className="widget-top">
            <span className="widget-badge">Thời tiết</span>
            <span className="widget-value">{weather ? Math.round(weather.temperature_2m) : '--'}°C</span>
          </div>
          <div className="widget-bottom">
            <div style={{ position: 'relative', zIndex: 10 }}>
              <select 
                value={city.name}
                onChange={(e) => setCity(VN_PROVINCES.find(p => p.name === e.target.value))}
                style={{ appearance: 'none', WebkitAppearance: 'none', background: 'transparent', border: 'none', color: 'white', fontSize: '1.25rem', fontWeight: 700, outline: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
              >
                {VN_PROVINCES.map(p => <option key={p.name} value={p.name} style={{color:'black'}}>{p.name}</option>)}
              </select>
            </div>
            <div className="weather-desc-box">
              <div>
                <div style={{fontWeight: 600, fontSize: '0.85rem'}}>{weather ? getWeatherInfo(weather.weather_code).label : 'Đang tải...'}</div>
                <div style={{fontSize: '0.75rem', opacity: 0.8, marginTop: '2px'}}>Hôm nay</div>
              </div>
              {weather && React.createElement(getWeatherInfo(weather.weather_code).icon, { size: 24, color: 'white' })}
            </div>
          </div>
          <div className="weather-icon-bg">
            {weather ? React.createElement(getWeatherInfo(weather.weather_code).icon, { size: 120, color: 'white' }) : <Cloud size={120} color="white"/>}
          </div>
        </div>

        <div className="widget-card widget-health">
          <div className="widget-top">
            <span className="widget-badge">Sức khỏe</span>
            <Activity size={24} style={{opacity: 0.5}}/>
          </div>
          <div className="widget-bottom">
            <div className="widget-value">8,432</div>
            <div className="widget-subtitle">Bước chân hôm nay</div>
            <div className="step-progress-bar"><div className="step-progress-fill"></div></div>
            <div style={{fontSize: '0.75rem', opacity: 0.8}}>Mục tiêu: 10,000 bước</div>
          </div>
          <div className="weather-icon-bg" style={{right: '10px', bottom: '10px', opacity: 0.1}}>
             <Activity size={100} color="white"/>
          </div>
        </div>

        <div className="widget-card widget-entertainment">
          <div className="widget-top">
            <span className="widget-badge">Giải trí</span>
            <Radio size={24} style={{opacity: 0.5}}/>
          </div>
          <div className="widget-bottom">
            <div className="player-box">
              <div className="player-icon" style={{display:'flex', alignItems:'center', justifyContent:'center'}}><Music size={16} color="white"/></div>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 700, fontSize: '0.9rem'}}>Radio Lofi</div>
                <div style={{fontSize: '0.75rem', opacity: 0.7}}>Chill cùng mưa</div>
              </div>
              <button style={{background:'rgba(255,255,255,0.1)', border:'none', borderRadius:'50%', width:'24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'white'}}><X size={14}/></button>
            </div>
          </div>
        </div>
      </div>
      <div className="dashboard-grid">
        <div className="chart-container glass">
          <h3>Thu & Chi (6 tháng gần nhất)</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="recent-transactions glass">
          <div className="section-header"><h3>Giao dịch gần đây</h3><button className="btn-text" onClick={() => setActiveTab('transactions')}>Xem tất cả</button></div>
          <ul className="transaction-list">
            {transactions.slice(0, 5).map(tx => {
              const cat = CATEGORIES[tx.category] || CATEGORIES.other;
              const Icon = cat.icon;
              return (
                <li key={tx.id} className="tx-item">
                  <div className="tx-info">
                    <div className="tx-icon" style={{backgroundColor: cat.color+'20', color: cat.color}}><Icon size={20}/></div>
                    <div className="tx-details"><h4>{cat.label}</h4><span>{format(new Date(tx.date), 'dd/MM/yyyy')} {tx.note && `- ${tx.note}`}</span></div>
                  </div>
                  <div className={`tx-amount ${tx.type==='income'?'text-success':'text-danger'}`}>
                    {tx.type==='income'?'+':'-'}{formatCur(tx.amount)}
                  </div>
                </li>
              );
            })}
            {transactions.length === 0 && <div className="empty-state">Chưa có giao dịch nào.</div>}
          </ul>
        </div>
      </div>
    </section>
  );

  const renderTransactions = () => (
    <section className="view">
      <div className="transaction-list-full">
        {transactions.map(tx => {
          const cat = CATEGORIES[tx.category] || CATEGORIES.other;
          const Icon = cat.icon;
          return (
            <div key={tx.id} className="tx-item glass" style={{marginBottom: '0.5rem'}}>
              <div className="tx-info">
                <div className="tx-icon" style={{backgroundColor: cat.color+'20', color: cat.color}}><Icon size={20}/></div>
                <div className="tx-details"><h4>{cat.label}</h4><span>{format(new Date(tx.date), 'dd/MM/yyyy')} {tx.note && `- ${tx.note}`}</span></div>
              </div>
              <div style={{display:'flex', gap:'1rem', alignItems:'center'}}>
                <div className={`tx-amount ${tx.type==='income'?'text-success':'text-danger'}`}>
                  {tx.type==='income'?'+':'-'}{formatCur(tx.amount)}
                </div>
                <button className="btn-text text-danger" onClick={async () => {
                  if(confirm('Xoá giao dịch này?')) await deleteDoc(doc(db, 'transactions', tx.id));
                }}><Trash2 size={18}/></button>
              </div>
            </div>
          )
        })}
        {transactions.length === 0 && <div className="empty-state glass p-4">Chưa có giao dịch.</div>}
      </div>
    </section>
  );

  const renderBudgets = () => (
    <section className="view">
      <div className="section-header">
        <h2>Ngân sách tháng này</h2>
        <button className="btn-primary" onClick={() => setShowBudgetModal(true)}><Plus size={20}/> Thiết lập</button>
      </div>
      <div className="budgets-grid">
        {budgets.map(b => {
          let spent = transactions.filter(tx => tx.type==='expense' && tx.category===b.category && new Date(tx.date).getMonth()===currentMonth && new Date(tx.date).getFullYear()===currentYear).reduce((acc, tx) => acc+tx.amount, 0);
          const cat = CATEGORIES[b.category] || CATEGORIES.other;
          const Icon = cat.icon;
          const pct = Math.min((spent/b.amount)*100, 100);
          let color = 'var(--primary-color)';
          if(pct >= 90) color = 'var(--danger-color)'; else if(pct >= 75) color = 'var(--warning-color)';
          
          return (
            <div key={b.id} className="budget-card glass">
              <div className="budget-header">
                <div className="budget-title"><Icon size={20} color={cat.color}/> {cat.label}</div>
                <button className="btn-text text-danger" onClick={async () => {
                  if(confirm('Xoá ngân sách?')) await deleteDoc(doc(db, 'budgets', b.id));
                }}><Trash2 size={18}/></button>
              </div>
              <div className="budget-progress"><div className="budget-progress-bg"><div className="budget-progress-fill" style={{width: `${pct}%`, backgroundColor: color}}></div></div></div>
              <div className="budget-stats" style={{marginTop:'0.5rem'}}><span>Đã chi: {formatCur(spent)}</span><span>{formatCur(b.amount)}</span></div>
            </div>
          )
        })}
        {budgets.length === 0 && <div className="empty-state glass">Chưa có ngân sách.</div>}
      </div>
    </section>
  );

  const renderIncome = () => (
    <section className="view">
      <div className="section-header">
        <h2>Mục tiêu thu nhập tháng này</h2>
        <button className="btn-primary" onClick={() => setShowIncomeModal(true)}><Plus size={20}/> Thiết lập khoản thu</button>
      </div>
      <div className="budgets-grid">
        {incomeGoals.map(g => {
          let earned = transactions.filter(tx => tx.type==='income' && tx.category===g.category && new Date(tx.date).getMonth()===currentMonth && new Date(tx.date).getFullYear()===currentYear).reduce((acc, tx) => acc+tx.amount, 0);
          const cat = CATEGORIES[g.category] || CATEGORIES.other;
          const Icon = cat.icon;
          const pct = Math.min((earned/g.amount)*100, 100);
          let color = 'var(--success-color)';
          
          return (
            <div key={g.id} className="budget-card glass">
              <div className="budget-header">
                <div className="budget-title"><Icon size={20} color={cat.color}/> {cat.label}</div>
                <button className="btn-text text-danger" onClick={async () => {
                  if(confirm('Xoá mục tiêu này?')) await deleteDoc(doc(db, 'incomeGoals', g.id));
                }}><Trash2 size={18}/></button>
              </div>
              <div className="budget-progress"><div className="budget-progress-bg"><div className="budget-progress-fill" style={{width: `${pct}%`, backgroundColor: color}}></div></div></div>
              <div className="budget-stats" style={{marginTop:'0.5rem'}}><span>Đã thu: {formatCur(earned)}</span><span>Mục tiêu: {formatCur(g.amount)}</span></div>
            </div>
          )
        })}
        {incomeGoals.length === 0 && <div className="empty-state glass">Chưa có mục tiêu thu nhập nào.</div>}
      </div>
    </section>
  );

  const renderDebts = () => {
    let repaidThisMonth = 0;
    transactions.forEach(tx => {
      if(tx.type === 'expense' && tx.category === 'repayment' && new Date(tx.date).getMonth()===currentMonth && new Date(tx.date).getFullYear()===currentYear) {
        repaidThisMonth += tx.amount;
      }
    });

    const totalMonthlyGoal = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);
    const pct = totalMonthlyGoal > 0 ? Math.min((repaidThisMonth / totalMonthlyGoal) * 100, 100) : 0;
    let color = 'var(--primary-color)';
    if(pct >= 100) color = 'var(--success-color)';

    return (
      <section className="view">
        <div className="section-header">
          <div>
            <h2>Sổ nợ</h2>
            <p style={{color: 'var(--text-secondary)'}}>Tổng dư nợ hiện tại: <strong className="text-danger">{formatCur(currentTotalDebt)}</strong></p>
          </div>
          <button className="btn-primary" onClick={() => setShowDebtModal(true)}><Plus size={20}/> Thêm khoản nợ</button>
        </div>

        <div className="glass" style={{padding: '1.5rem', marginBottom: '2rem'}}>
          <h3>Mục tiêu trả nợ tháng này</h3>
          <div className="budget-progress" style={{margin: '1rem 0'}}><div className="budget-progress-bg"><div className="budget-progress-fill" style={{width: `${pct}%`, backgroundColor: color}}></div></div></div>
          <div className="budget-stats"><span>Đã trả: {formatCur(repaidThisMonth)}</span><span>Mục tiêu: {formatCur(totalMonthlyGoal)}</span></div>
        </div>

        <div className="budgets-grid">
          {debts.map(d => (
            <div key={d.id} className="budget-card glass">
              <div className="budget-header">
                <div className="budget-title"><Landmark size={20} color="#ef4444"/> {d.name}</div>
                <button className="btn-text text-danger" onClick={async () => {
                  if(confirm('Xoá khoản nợ? (Sẽ làm giảm tổng dư nợ)')) await deleteDoc(doc(db, 'debts', d.id));
                }}><Trash2 size={18}/></button>
              </div>
              <div style={{marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                <div className="budget-stats"><span>Khoản vay gốc:</span><strong>{formatCur(d.amount)}</strong></div>
                <div className="budget-stats"><span>Kế hoạch trả/tháng:</span><strong>{formatCur(d.monthlyPayment)}</strong></div>
              </div>
            </div>
          ))}
          {debts.length === 0 && <div className="empty-state glass">Bạn chưa ghi nhận khoản nợ nào. Tuyệt vời!</div>}
        </div>
      </section>
    );
  };

  const renderReports = () => {
    // Expense Pie Chart data
    const expenseByCategory = {};
    transactions.forEach(tx => {
      if(tx.type === 'expense' && new Date(tx.date).getMonth()===currentMonth && new Date(tx.date).getFullYear()===currentYear) {
        expenseByCategory[tx.category] = (expenseByCategory[tx.category] || 0) + tx.amount;
      }
    });
    
    const pieLabels = [];
    const pieData = [];
    const pieColors = [];
    
    Object.keys(expenseByCategory).forEach(cat => {
      pieLabels.push(CATEGORIES[cat]?.label || 'Khác');
      pieData.push(expenseByCategory[cat]);
      pieColors.push(CATEGORIES[cat]?.color || '#64748b');
    });

    const doughnutData = {
      labels: pieLabels,
      datasets: [{
        data: pieData,
        backgroundColor: pieColors,
        borderWidth: 0,
        hoverOffset: 4
      }]
    };

    return (
      <section className="view">
        <div className="dashboard-grid">
          <div className="chart-container glass" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h3>Cơ cấu chi tiêu tháng này</h3>
            {pieData.length > 0 ? (
              <div style={{width: '300px', margin: '0 auto'}}>
                <Doughnut data={doughnutData} options={{plugins: {legend: {position: 'bottom', labels: {color: textColor}}}, cutout: '70%'}} />
              </div>
            ) : (
              <div className="empty-state" style={{marginTop: '2rem'}}>Chưa có dữ liệu chi tiêu.</div>
            )}
          </div>
          
          <div className="chart-container glass">
            <h3>Tóm tắt tài chính</h3>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-glass-border)', paddingBottom: '0.5rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Thu nhập tháng này</span>
                <span className="text-success" style={{fontWeight: 600}}>{formatCur(income)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--bg-glass-border)', paddingBottom: '0.5rem'}}>
                <span style={{color: 'var(--text-secondary)'}}>Chi tiêu tháng này</span>
                <span className="text-danger" style={{fontWeight: 600}}>{formatCur(expense)}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{color: 'var(--text-secondary)'}}>Số dư khả dụng</span>
                <span style={{fontWeight: 600, fontSize: '1.25rem', color: (income - expense) >= 0 ? 'var(--primary-color)' : 'var(--danger-color)'}}>{formatCur(income - expense)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderMembers = () => {
    const spending = { all: 0 };
    members.forEach(m => spending[m.id] = 0);
    transactions.forEach(tx => {
      if(tx.type === 'expense' && new Date(tx.date).getMonth()===currentMonth && new Date(tx.date).getFullYear()===currentYear) {
        spending[tx.memberId || 'all'] += tx.amount;
      }
    });
    spending['admin'] += spending['all'];

    return (
      <section className="view">
        <div className="section-header">
          <h2>Thành viên gia đình</h2>
          <button className="btn-primary" onClick={() => setShowMemberModal(true)}><UserPlus size={20}/> Thêm thành viên</button>
        </div>
        <div className="members-grid">
          {members.map(m => (
            <div key={m.id} className="member-card glass">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random`} className="member-avatar" alt="Ava"/>
              <h3 className="member-name">{m.name}</h3><span className="member-role">{m.role}</span>
              <div style={{marginTop:'1rem', width:'100%', textAlign:'left', borderTop:'1px solid var(--bg-glass-border)', paddingTop:'1rem'}}>
                <p style={{fontSize:'0.875rem', color:'var(--text-secondary)'}}>Chi tiêu tháng này</p>
                <h4 className="text-danger" style={{fontSize:'1.25rem'}}>{formatCur(spending[m.id])}</h4>
              </div>
              {m.role !== 'Quản trị viên' && <button className="btn-text text-danger" style={{marginTop:'0.5rem'}} onClick={async () => {
                if(confirm('Xoá thành viên?')) await deleteDoc(doc(db, 'members', m.id));
              }}>Xoá thành viên</button>}
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header"><div className="logo"><Wallet size={32}/> <span style={{fontSize: '1.2rem', lineHeight: 1.2}}>Quản Lý Chi Tiêu</span></div></div>
        <ul className="nav-links">
          {[
            {id:'dashboard', icon:Home, label:'Tổng quan'}, 
            {id:'transactions', icon:Receipt, label:'Giao dịch'}, 
            {id:'income', icon:Target, label:'Thu nhập'}, 
            {id:'budgets', icon:PieChart, label:'Ngân sách'}, 
            {id:'debts', icon:Landmark, label:'Sổ nợ'}, 
            {id:'reports', icon:BarChart2, label:'Báo cáo'}, 
            {id:'family', icon:Users, label:'Thành viên'}
          ].map(tab => (
            <li key={tab.id} className={activeTab===tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
              <tab.icon size={20}/><span>{tab.label}</span>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          <div className="user-profile"><img src="https://ui-avatars.com/api/?name=Admin&background=random" className="avatar" alt="Ava"/><div className="user-info"><span className="user-name">Gia đình Vinh</span><span className="user-role">Quản trị viên</span></div></div>
          <button className="theme-toggle" onClick={toggleTheme}>{theme==='dark' ? <Sun/>:<Moon/>}</button>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-header">
          <h1>{{dashboard: 'Tổng quan', transactions: 'Giao dịch', income: 'Thu nhập', budgets: 'Ngân sách', debts: 'Sổ nợ', reports: 'Báo cáo', family: 'Thành viên'}[activeTab]}</h1>
          <button className="btn-primary" onClick={() => setShowTxModal(true)}><Plus size={20}/> Thêm giao dịch</button>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'income' && renderIncome()}
        {activeTab === 'budgets' && renderBudgets()}
        {activeTab === 'debts' && renderDebts()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'family' && renderMembers()}
      </main>

      {/* Modals */}
      {showTxModal && (
        <div className="modal-overlay">
          <div className="modal glass">
            <div className="modal-header"><h2>Thêm Giao Dịch</h2><button className="close-modal" onClick={() => setShowTxModal(false)}><X/></button></div>
            <div className="modal-body">
              <form onSubmit={handleTxSubmit}>
                <div className="form-group row">
                  <button type="button" className={`btn-toggle ${txForm.type==='expense'?'active':''}`} data-type="expense" onClick={()=>setTxForm(p=>({...p, type:'expense', category:'food'}))}>Tiền Chi</button>
                  <button type="button" className={`btn-toggle ${txForm.type==='income'?'active':''}`} data-type="income" onClick={()=>setTxForm(p=>({...p, type:'income', category:'salary'}))}>Tiền Thu</button>
                </div>
                <div className="form-group"><label>Số tiền (VNĐ)</label><input type="text" inputMode="numeric" className="input-field" required value={formatInput(txForm.amount)} onChange={e=>handleNumChange(e.target.value, setTxForm, 'amount', txForm)}/></div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select className="input-field" value={txForm.category} onChange={e=>setTxForm({...txForm, category: e.target.value})}>
                    {Object.entries(CATEGORIES).filter(([k,v]) => txForm.type==='expense' ? !['salary','business','gift','investment','loan'].includes(k) : ['salary','business','gift','investment','loan','other'].includes(k)).map(([k,v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group"><label>Ngày giao dịch</label><input type="date" className="input-field" required value={txForm.date} onChange={e=>setTxForm({...txForm, date: e.target.value})}/></div>
                <div className="form-group">
                  <label>Thành viên</label>
                  <select className="input-field" value={txForm.memberId} onChange={e=>setTxForm({...txForm, memberId: e.target.value})}>
                    <option value="all">Sử dụng chung</option>
                    {members.filter(m=>m.id!=='admin').map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Ghi chú</label><input type="text" className="input-field" placeholder="Ví dụ: Ăn trưa..." value={txForm.note} onChange={e=>setTxForm({...txForm, note: e.target.value})}/></div>
                <button type="submit" className="btn-primary full-width">Lưu Giao Dịch</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showBudgetModal && (
        <div className="modal-overlay">
          <div className="modal glass"><div className="modal-header"><h2>Thiết Lập Ngân Sách</h2><button className="close-modal" onClick={() => setShowBudgetModal(false)}><X/></button></div>
            <div className="modal-body">
              <form onSubmit={handleBudgetSubmit}>
                <div className="form-group"><label>Danh mục</label><select className="input-field" value={budgetForm.category} onChange={e=>setBudgetForm({...budgetForm, category: e.target.value})}>{Object.entries(CATEGORIES).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
                <div className="form-group"><label>Ngân sách tối đa</label><input type="text" inputMode="numeric" className="input-field" required value={formatInput(budgetForm.amount)} onChange={e=>handleNumChange(e.target.value, setBudgetForm, 'amount', budgetForm)}/></div>
                <button type="submit" className="btn-primary full-width">Lưu</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showIncomeModal && (
        <div className="modal-overlay">
          <div className="modal glass"><div className="modal-header"><h2>Mục tiêu thu nhập</h2><button className="close-modal" onClick={() => setShowIncomeModal(false)}><X/></button></div>
            <div className="modal-body">
              <form onSubmit={handleIncomeSubmit}>
                <div className="form-group"><label>Nguồn thu</label><select className="input-field" value={incomeForm.category} onChange={e=>setIncomeForm({...incomeForm, category: e.target.value})}>{['salary', 'business', 'gift', 'investment', 'other'].map(k=><option key={k} value={k}>{CATEGORIES[k].label}</option>)}</select></div>
                <div className="form-group"><label>Mục tiêu (VNĐ)</label><input type="text" inputMode="numeric" className="input-field" required value={formatInput(incomeForm.amount)} onChange={e=>handleNumChange(e.target.value, setIncomeForm, 'amount', incomeForm)}/></div>
                <button type="submit" className="btn-primary full-width">Lưu</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDebtModal && (
        <div className="modal-overlay">
          <div className="modal glass"><div className="modal-header"><h2>Thêm Khoản Nợ Mới</h2><button className="close-modal" onClick={() => setShowDebtModal(false)}><X/></button></div>
            <div className="modal-body">
              <form onSubmit={handleDebtSubmit}>
                <div className="form-group"><label>Tên khoản nợ (VD: Mua nhà, ...)</label><input type="text" className="input-field" required value={debtForm.name} onChange={e=>setDebtForm({...debtForm, name: e.target.value})}/></div>
                <div className="form-group"><label>Tổng số tiền nợ gốc</label><input type="text" inputMode="numeric" className="input-field" required value={formatInput(debtForm.amount)} onChange={e=>handleNumChange(e.target.value, setDebtForm, 'amount', debtForm)}/></div>
                <div className="form-group"><label>Mục tiêu trả nợ mỗi tháng</label><input type="text" inputMode="numeric" className="input-field" required value={formatInput(debtForm.monthlyPayment)} onChange={e=>handleNumChange(e.target.value, setDebtForm, 'monthlyPayment', debtForm)}/></div>
                <button type="submit" className="btn-primary full-width">Lưu Khoản Nợ</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal glass"><div className="modal-header"><h2>Thêm Thành Viên</h2><button className="close-modal" onClick={() => setShowMemberModal(false)}><X/></button></div>
            <div className="modal-body">
              <form onSubmit={handleMemberSubmit}>
                <div className="form-group"><label>Tên</label><input type="text" className="input-field" required value={memberForm.name} onChange={e=>setMemberForm({...memberForm, name: e.target.value})}/></div>
                <div className="form-group"><label>Vai trò</label><select className="input-field" value={memberForm.role} onChange={e=>setMemberForm({...memberForm, role: e.target.value})}><option>Vợ/Chồng</option><option>Con cái</option><option>Khác</option></select></div>
                <button type="submit" className="btn-primary full-width">Thêm</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
