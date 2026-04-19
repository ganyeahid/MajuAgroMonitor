import React, { useState, useEffect, useRef } from 'react';
import { 
  Leaf, 
  Droplets, 
  AlertTriangle, 
  Mic, 
  MicOff, 
  Save,
  LayoutDashboard,
  Sprout,
  CheckCircle2,
  Camera,
  Settings,
  Activity,
  Plus,
  Trash2,
  UserCircle,
  MapPin,
  QrCode,
  CalendarDays,
  Users,
  Lock,
  LogOut,
  Image as ImageIcon
} from 'lucide-react';

// --- Mock Data Awal ---
const initialPlants = [
  { 
    id: 1, treeCode: 'A1-001-01', jenisTanaman: 'Alpukat', varietas: 'Miki', supplier: 'CV Bibit Unggul',
    subzona: 'A1', jalur: '1', noPohon: '1', gps: '-6.200000, 106.816666',
    tglTanam: '2023-03-01', tglTambalSulam: '', 
    fase: 'TM', status: 'Sehat', 
    panenTotal: 15, panenTgl: '2025-10-12', panenVol: 5, prediksiBlnThn: '2026-10', prediksiVol: 20,
    tsTgl: '', tsVarietas: '', tsKeterangan: '', photo: null, notes: 'Pertumbuhan sangat baik, sudah mulai berbuah stabil.' 
  },
  { 
    id: 2, treeCode: 'B1-012-05', jenisTanaman: 'Jambu Air', varietas: 'Madu Deli', supplier: 'Koperasi Tani',
    subzona: 'B1', jalur: '12', noPohon: '5', gps: '-6.201000, 106.817000',
    tglTanam: '2025-01-15', tglTambalSulam: '2025-06-10', 
    fase: 'TBM', status: 'Tambal Sulam', 
    panenTotal: 0, panenTgl: '', panenVol: 0, prediksiBlnThn: '', prediksiVol: 0,
    tsTgl: '2025-06-10', tsVarietas: 'Madu Deli Hijau', tsKeterangan: 'Pohon lama mati kekeringan', photo: null, notes: 'Pohon baru pengganti.' 
  },
];

const initialLogs = [
  { id: 1, plantId: 1, type: 'Penyiraman', date: '2026-04-06', officer: 'Siddhartha (Admin)', notes: 'Penyiraman rutin 500ml', photo: null, isDone: true }
];

const initialUsers = [
  { id: 1, username: 'admin', password: '123', name: 'Siddhartha', role: 'Admin' },
  { id: 2, username: 'manager', password: '123', name: 'Budi', role: 'Manager' },
  { id: 3, username: 'asisten', password: '123', name: 'Citra', role: 'Asisten Kebun' },
  { id: 4, username: 'pekerja', password: '123', name: 'Dodo', role: 'Pekerja' },
  { id: 5, username: 'pengawas', password: '123', name: 'Eko', role: 'Pengurus/Pengawas' },
];

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Main App State
  const [activeTab, setActiveTab] = useState('plants'); 
  const [plants, setPlants] = useState(initialPlants);
  const [logs, setLogs] = useState(initialLogs);
  
  // Settings State
  const [activityItems, setActivityItems] = useState(['Pengecekan Rutin', 'Penyiraman', 'Pemupukan Organik', 'Penyemprotan Hama', 'Pemangkasan (Pruning)']);
  
  // Modals & Temp States
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState(null); // Custom Confirm Fix
  
  // User Management Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUserForm, setNewUserForm] = useState({ username: '', password: '', name: '', role: 'Pekerja' });

  // Form State Tanaman (Restored & Expanded)
  const defaultPlantState = {
    jenisTanaman: '', varietas: '', supplier: '',
    subzona: 'A1', jalur: '', noPohon: '', gps: '',
    tglTanam: new Date().toISOString().split('T')[0], tglTambalSulam: '',
    fase: 'TBM', status: 'Sehat', 
    panenTotal: '', panenTgl: '', panenVol: '', prediksiBlnThn: '', prediksiVol: '',
    tsTgl: '', tsVarietas: '', tsKeterangan: '',
    photo: null, notes: ''
  };
  const [newPlant, setNewPlant] = useState(defaultPlantState);
  const [editingPlantItem, setEditingPlantItem] = useState(null);
  
  const [newLog, setNewLog] = useState({ plantId: '', type: activityItems[0], notes: '', photo: null });

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceNoteSaved, setVoiceNoteSaved] = useState(false);
  const recognitionRef = useRef(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID'; 

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) currentTranscript += event.results[i][0].transcript + ' ';
        }
        if (currentTranscript) setTranscript((prev) => prev + currentTranscript);
      };
      recognition.onerror = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // --- AUTH LOGIC ---
  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === loginForm.username.toLowerCase() && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      setActiveTab('dashboard');
    } else {
      setLoginError('Username atau Password tidak cocok.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
  };

  // --- USER MANAGEMENT LOGIC ---
  const handleSaveUser = (e) => {
    e.preventDefault();
    if (editingUser) {
      // Edit mode
      setUsers(users.map(u => u.id === editingUser.id ? { 
        ...u, 
        username: newUserForm.username, 
        name: newUserForm.name, 
        role: newUserForm.role,
        // Only Admin can update password for existing users
        password: (currentUser.role === 'Admin' && newUserForm.password) ? newUserForm.password : u.password 
      } : u));
    } else {
      // Add mode
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      setUsers([...users, { ...newUserForm, id: newId }]);
    }
    setShowUserModal(false);
  };

  const openUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setNewUserForm({ username: user.username, password: '', name: user.name, role: user.role });
    } else {
      setEditingUser(null);
      setNewUserForm({ username: '', password: '', name: '', role: 'Pekerja' });
    }
    setShowUserModal(true);
  };

  // --- PLANT & LOG LOGIC ---
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewPlant({...newPlant, gps: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`});
        },
        (error) => alert('Gagal mendapatkan GPS. Pastikan izin lokasi aktif.')
      );
    } else {
      alert('GPS tidak didukung di perangkat ini.');
    }
  };

  const handleAddPlant = (e) => {
    e.preventDefault();
    const jalurStr = newPlant.jalur.toString().padStart(3, '0');
    const noStr = newPlant.noPohon.toString().padStart(2, '0');
    const treeCode = `${newPlant.subzona}-${jalurStr}-${noStr}`;

    if (editingPlantItem) {
      setPlants(plants.map(p => p.id === editingPlantItem.id ? { ...newPlant, treeCode } : p));
      setEditingPlantItem(null);
    } else {
      const newId = plants.length > 0 ? Math.max(...plants.map(p => p.id)) + 1 : 1;
      setPlants([{ ...newPlant, id: newId, treeCode }, ...plants]);
    }
    setShowAddPlant(false);
    setNewPlant(defaultPlantState);
  };

  const confirmDeletePlant = () => {
    if (plantToDelete) {
      setPlants(plants.filter(p => p.id !== plantToDelete.id));
      setPlantToDelete(null);
    }
  };

  const openEditPlant = (plant) => {
    setNewPlant(plant);
    setEditingPlantItem(plant);
    setShowAddPlant(true);
  };

  const handleAddLog = (e) => {
    e.preventDefault();
    if(!newLog.plantId) return alert('Pilih tanaman terlebih dahulu!');
    
    const newId = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    setLogs([{ 
      id: newId, 
      plantId: parseInt(newLog.plantId), 
      type: newLog.type, 
      date: new Date().toISOString().split('T')[0], 
      officer: `${currentUser.name} (${currentUser.role})`,
      notes: newLog.notes,
      photo: newLog.photo,
      isDone: false
    }, ...logs]);
    
    setShowAddLog(false);
    setNewLog({ plantId: '', type: activityItems[0], notes: '', photo: null });
  };

  const toggleLogDone = (id) => {
    if (['Admin', 'Manager', 'Asisten Kebun'].includes(currentUser.role)) {
      setLogs(logs.map(l => l.id === id ? { ...l, isDone: !l.isDone } : l));
    }
  };

  const handlePhotoCapture = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if(target === 'log') setNewLog({ ...newLog, photo: reader.result });
        if(target === 'plant') setNewPlant({ ...newPlant, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setVoiceNoteSaved(false);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const saveVoiceNote = () => {
    if (transcript.trim() !== '') {
      const newLogEntry = {
        id: Date.now(),
        plantId: plants[0]?.id || 1, 
        type: 'Catatan Suara Lapangan',
        date: new Date().toISOString().split('T')[0],
        officer: `${currentUser.name} (${currentUser.role})`,
        notes: transcript,
        photo: null,
        isDone: true
      };
      setLogs([newLogEntry, ...logs]);
      setVoiceNoteSaved(true);
      setTimeout(() => setVoiceNoteSaved(false), 3000);
      setTranscript('');
    }
  };


  // --- VIEWS ---

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="bg-green-700 p-8 text-center text-white relative">
            {/* LOGO 1: Layar Login */}
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden">
               <img src="logo_login.png" alt="Logo Maju Agro" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}/>
               <Leaf size={36} className="text-white hidden" />
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-1">MAJU AGRO</h1>
            <p className="text-green-100 text-sm">Sistem Monitoring V2.2</p>
          </div>
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium text-center border border-red-100">{loginError}</div>}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Username</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 text-gray-400" size={18}/>
                  <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium" placeholder="Masukkan username" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                  <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm font-medium" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-colors mt-2 uppercase tracking-wide text-sm">
                Masuk Sistem
              </button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400 font-medium">Test Akun: admin / manager / asisten / pekerja<br/>Password: 123</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] font-sans pb-24 lg:pb-0">
      {/* Navbar Atas */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            {/* LOGO 2: Navigasi Atas */}
            <div className="bg-green-600 w-8 h-8 rounded-lg mr-3 shadow-md overflow-hidden flex items-center justify-center">
              <img src="logo_navbar.png" alt="Logo Nav" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}/>
              <Leaf className="h-5 w-5 text-white hidden" />
            </div>
            <span className="text-lg font-black text-green-900 tracking-tighter uppercase">Maju Agro</span>
          </div>
          
          <div className="hidden lg:flex items-center space-x-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'plants', icon: Sprout, label: 'Tanaman' },
              { id: 'logs', icon: Activity, label: 'Aktivitas' },
              { id: 'voice', icon: Mic, label: 'Voice' },
              { id: 'users', icon: Users, label: 'Pengaturan', restrict: ['Admin', 'Manager'] }
            ].filter(tab => !tab.restrict || tab.restrict.includes(currentUser.role)).map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl flex items-center text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <tab.icon size={18} className="mr-2" />
                {tab.label}
              </button>
            ))}
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button onClick={handleLogout} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl flex items-center text-sm font-bold">
              <LogOut size={18} className="mr-1" /> Keluar
            </button>
          </div>
          
          <div className="lg:hidden">
            <button onClick={handleLogout} className="p-2 text-red-500 bg-red-50 rounded-lg">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* --- TAB: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-800">Dashboard</h2>
              <div className="text-right">
                <p className="text-sm font-bold text-green-900">{currentUser.name}</p>
                <span className="text-[10px] bg-green-200 px-2 py-0.5 rounded uppercase font-bold text-green-800">{currentUser.role}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
                <p className="text-xs text-gray-500 font-medium uppercase">Total Tanaman</p>
                <p className="text-2xl font-bold text-gray-800">{plants.length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                <p className="text-xs text-gray-500 font-medium uppercase">Kondisi Sehat</p>
                <p className="text-2xl font-bold text-blue-600">{plants.filter(p => p.status === 'Sehat').length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                <p className="text-xs text-gray-500 font-medium uppercase">Abnormal/Mati</p>
                <p className="text-2xl font-bold text-orange-600">{plants.filter(p => p.status === 'Abnormal' || p.status === 'Mati').length}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-purple-100">
                <p className="text-xs text-gray-500 font-medium uppercase">Log Aktivitas</p>
                <p className="text-2xl font-bold text-purple-600">{logs.length}</p>
              </div>
            </div>
            
            {['Admin', 'Manager', 'Asisten Kebun', 'Pekerja'].includes(currentUser.role) && (
              <div className="bg-green-600 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 text-white">
                <div>
                  <h3 className="font-bold text-lg">Input Cepat Lapangan</h3>
                  <p className="text-green-100 text-sm">Catat aktivitas atau pantau kondisi tanaman terbaru.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={() => setShowAddLog(true)} className="flex-1 bg-white text-green-700 px-4 py-2 rounded-xl font-bold shadow-sm flex items-center justify-center hover:bg-gray-50">
                    <Plus size={18} className="mr-1"/> Catat Aktivitas
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB: TANAMAN --- */}
        {activeTab === 'plants' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-800">Database Tanaman</h2>
              {['Admin', 'Manager', 'Asisten Kebun'].includes(currentUser.role) && (
                <button onClick={() => { setEditingPlantItem(null); setNewPlant(defaultPlantState); setShowAddPlant(true); }} className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center">
                  <Plus size={16} className="mr-1"/> Tambah Pohon
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plants.map(plant => (
                <div key={plant.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 font-mono tracking-tight flex items-center gap-2">
                        <QrCode size={16} className="text-gray-400"/>
                        {plant.treeCode}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{plant.jenisTanaman} • {plant.varietas}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${plant.status === 'Sehat' ? 'bg-green-100 text-green-700' : plant.status === 'Abnormal' ? 'bg-orange-100 text-orange-700' : plant.status === 'Mati' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {plant.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${plant.fase === 'TM' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                        {plant.fase === 'TM' ? 'Generatif (TM)' : 'Vegetatif (TBM)'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-1"><MapPin size={12}/> {plant.gps || 'Belum diset'}</div>
                    <div className="flex items-center gap-1"><CalendarDays size={12}/> Tanam: {plant.tglTanam}</div>
                  </div>

                  {plant.fase === 'TM' && (
                    <div className="bg-purple-50 p-2.5 rounded-xl text-xs text-purple-800 mb-3 border border-purple-100">
                      <span className="font-semibold">Panen:</span> {plant.panenTotal} Kg (Total) • Prediksi: {plant.prediksiBlnThn} ({plant.prediksiVol} Kg)
                    </div>
                  )}

                  <div className="bg-green-50 p-2.5 rounded-xl text-xs text-green-800 italic flex-1 border border-green-100">
                    "{plant.notes || 'Tidak ada catatan.'}"
                  </div>
                  
                  {plant.photo && (
                    <div className="mt-3">
                      <img src={plant.photo} alt="Foto Tanaman" className="h-32 w-full object-cover rounded-xl border border-gray-200" />
                    </div>
                  )}

                  {/* Tombol Hapus / Edit */}
                  {['Admin', 'Manager', 'Asisten Kebun'].includes(currentUser.role) && (
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                      <button onClick={() => openEditPlant(plant)} className="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-bold text-xs flex items-center transition-colors">
                        <Edit3 size={14} className="mr-1"/> Edit
                      </button>
                      <button onClick={() => setPlantToDelete(plant)} className="px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-bold text-xs flex items-center transition-colors">
                        <Trash2 size={14} className="mr-1"/> Hapus
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {plants.length === 0 && <p className="text-center text-gray-500 py-8 col-span-2">Belum ada tanaman terdaftar.</p>}
            </div>
          </div>
        )}

        {/* --- TAB: AKTIVITAS --- */}
        {activeTab === 'logs' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-800">Log Aktivitas</h2>
              {['Admin', 'Manager', 'Asisten Kebun', 'Pekerja'].includes(currentUser.role) && (
                <button onClick={() => setShowAddLog(true)} className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center">
                  <Plus size={16} className="mr-1"/> Catat Baru
                </button>
              )}
            </div>
            <div className="space-y-3">
              {logs.map(log => {
                const plant = plants.find(p => p.id === log.plantId);
                return (
                  <div key={log.id} className={`bg-white p-4 rounded-2xl shadow-sm border ${log.isDone ? 'border-green-200 bg-green-50/50' : 'border-gray-100'} flex flex-col sm:flex-row gap-4`}>
                    <div className="flex justify-between sm:hidden mb-2">
                      <h3 className={`font-bold ${log.isDone ? 'text-green-800 line-through' : 'text-gray-800'}`}>{log.type}</h3>
                      {['Admin', 'Manager', 'Asisten Kebun'].includes(currentUser.role) && (
                        <button onClick={() => toggleLogDone(log.id)} className={`text-sm font-bold ${log.isDone ? 'text-green-600' : 'text-gray-400'}`}>
                          {log.isDone ? 'TERVERIFIKASI' : 'TANDAI SELESAI'}
                        </button>
                      )}
                    </div>
                    
                    {log.photo && (
                      <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0">
                        <img src={log.photo} alt="Bukti" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="hidden sm:flex justify-between items-start mb-1">
                        <h3 className={`font-bold text-lg ${log.isDone ? 'text-green-800 line-through' : 'text-gray-800'}`}>{log.type}</h3>
                        <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{log.date}</span>
                      </div>
                      <p className="text-sm font-bold text-green-700 mb-1">Target: {plant ? `${plant.treeCode} (${plant.jenisTanaman})` : 'Umum'}</p>
                      <p className="text-sm text-gray-600 mb-3">{log.notes}</p>
                      
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-2">
                        <div className="flex items-center text-xs text-gray-500 font-medium">
                          <UserCircle size={14} className="mr-1"/> Dilaporkan: <span className="font-bold ml-1">{log.officer}</span>
                        </div>
                        
                        {['Admin', 'Manager', 'Asisten Kebun'].includes(currentUser.role) ? (
                          <button onClick={() => toggleLogDone(log.id)} className={`hidden sm:flex items-center text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${log.isDone ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {log.isDone ? <CheckCircle2 size={14} className="mr-1"/> : <Circle size={14} className="mr-1"/>}
                            {log.isDone ? 'Selesai' : 'Tandai Selesai'}
                          </button>
                        ) : (
                          log.isDone && <span className="hidden sm:flex text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">SELESAI</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {logs.length === 0 && <p className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-dashed border-gray-200">Belum ada aktivitas tercatat.</p>}
            </div>
          </div>
        )}

        {/* --- TAB: VOICE --- */}
        {activeTab === 'voice' && (
          <div className="max-w-2xl mx-auto space-y-6 text-center animate-in fade-in py-8">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Jurnal Suara Lapangan</h2>
            <p className="text-gray-600 text-sm mb-6">Ucapkan kondisi terkini dalam Bahasa Indonesia.</p>

            <div className="bg-white p-8 rounded-3xl shadow-lg border border-green-100">
              <button
                onClick={toggleRecording}
                className={`p-8 rounded-full mb-6 transition-all transform shadow-xl mx-auto flex items-center justify-center ${
                  isRecording ? 'bg-red-100 text-red-600 animate-pulse border-4 border-red-200 scale-110' : 'bg-green-100 text-green-600 border-4 border-green-200 hover:scale-105'
                }`}
              >
                {isRecording ? <MicOff size={48} /> : <Mic size={48} />}
              </button>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {isRecording ? 'Mendengarkan suara Anda...' : 'Tekan ikon untuk bicara'}
              </h3>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Hasil transkripsi suara..."
                className="w-full h-32 p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 resize-none text-gray-700 bg-gray-50 text-sm font-medium"
              ></textarea>
              <button 
                onClick={saveVoiceNote}
                disabled={!transcript.trim() || isRecording}
                className={`w-full mt-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs transition-colors inline-flex justify-center items-center ${
                  !transcript.trim() || isRecording ? 'bg-gray-200 text-gray-400' : 'bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700'
                }`}
              >
                <Save size={18} className="mr-2" /> Simpan Ke Log
              </button>
              {voiceNoteSaved && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-xl flex items-center justify-center text-sm font-bold">
                  <CheckCircle2 size={18} className="mr-2" /> Berhasil Disimpan!
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB: SETTINGS (USER MANAGEMENT) --- */}
        {activeTab === 'users' && ['Admin', 'Manager'].includes(currentUser.role) && (
          <div className="space-y-6 animate-in fade-in pb-10">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-green-800">Manajemen Pengguna</h2>
              <button onClick={() => openUserModal()} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center">
                <Plus size={16} className="mr-1"/> Tambah User
              </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Nama & Username</th>
                      <th className="px-6 py-4">Level Akses</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800 text-sm">{u.name}</div>
                          <div className="text-xs text-gray-400 font-mono">@{u.username}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : u.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => openUserModal(u)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors flex items-center">
                            <Edit3 size={14} className="mr-1"/> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center py-2 px-1 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
          { id: 'plants', icon: Sprout, label: 'Pohon' },
          { id: 'logs', icon: Activity, label: 'Log' },
          { id: 'voice', icon: Mic, label: 'Voice' },
          { id: 'users', icon: Users, label: 'Akun', restrict: ['Admin', 'Manager'] }
        ].filter(tab => !tab.restrict || tab.restrict.includes(currentUser.role)).map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 flex-1 py-1 ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400'}`}
          >
            <tab.icon size={20} />
            <span className="text-[10px] font-bold uppercase">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ===================== MODALS ===================== */}

      {/* CUSTOM CONFIRM DELETE PLANT */}
      {plantToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <AlertTriangle size={36} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Hapus Tanaman?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Apakah Anda yakin ingin menghapus data <span className="font-bold text-gray-800">{plantToDelete.treeCode}</span> secara permanen? Aksi ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setPlantToDelete(null)} className="flex-1 py-3.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors">Batal</button>
              <button onClick={confirmDeletePlant} className="flex-1 py-3.5 bg-red-600 text-white shadow-lg shadow-red-200 hover:bg-red-700 rounded-xl font-bold text-sm transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL USER MANAGEMENT */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-green-900">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nama Lengkap</label>
                <input required type="text" value={newUserForm.name} onChange={e => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Username Login</label>
                <input required type="text" value={newUserForm.username} onChange={e => setNewUserForm({...newUserForm, username: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500" disabled={editingUser && currentUser.role !== 'Admin'} />
              </div>
              
              {/* Logika Password: 
                  - Form Add User (semua yg berhak nambah bisa lihat/set password awal)
                  - Form Edit User (hanya Admin yang bisa lihat/ubah password eksisting) 
              */}
              {(!editingUser || currentUser.role === 'Admin') && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    {editingUser ? 'Ubah Password (Isi untuk mengubah)' : 'Password Awal'}
                  </label>
                  <input required={!editingUser} type="text" value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-green-500" placeholder={editingUser ? "Biarkan kosong jika tidak diubah" : "Password default"} />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Level Akses (Role)</label>
                <select value={newUserForm.role} onChange={e => setNewUserForm({...newUserForm, role: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-green-500" disabled={editingUser && currentUser.role !== 'Admin' && editingUser.role === 'Admin'}>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Asisten Kebun">Asisten Kebun</option>
                  <option value="Pekerja">Pekerja</option>
                  <option value="Pengurus/Pengawas">Pengurus/Pengawas</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3.5 bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH/EDIT TANAMAN (Expanded) */}
      {showAddPlant && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-green-900">{editingPlantItem ? 'Edit Pohon' : 'Pohon Baru'}</h3>
              <div className="bg-green-100 px-3 py-1 rounded-full text-[10px] font-bold text-green-800 uppercase border border-green-200">
                ID: {newPlant.subzona}-{newPlant.jalur || '0'}-{newPlant.noPohon || '0'}
              </div>
            </div>
            
            <form id="addPlantForm" onSubmit={handleAddPlant} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-8">
              {/* --- DATA UMUM --- */}
              <div>
                <h4 className="font-bold text-green-700 border-b-2 border-green-100 pb-2 mb-4 text-xs uppercase tracking-widest flex items-center gap-2"><Sprout size={16}/> Data Umum</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Jenis Tanaman</label>
                    <input required type="text" value={newPlant.jenisTanaman} onChange={e => setNewPlant({...newPlant, jenisTanaman: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-green-500" placeholder="Cth: Alpukat" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Varietas</label>
                    <input required type="text" value={newPlant.varietas} onChange={e => setNewPlant({...newPlant, varietas: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-green-500" placeholder="Cth: Miki" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Batang Bawah / Supplier</label>
                    <input type="text" value={newPlant.supplier} onChange={e => setNewPlant({...newPlant, supplier: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500" placeholder="Nama supplier bibit" />
                  </div>
                  
                  {/* LOKASI */}
                  <div className="sm:col-span-2 grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Subzona</label>
                      <select value={newPlant.subzona} onChange={e => setNewPlant({...newPlant, subzona: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold bg-white">
                        <option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option><option>C2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Jalur (No)</label>
                      <input required type="number" value={newPlant.jalur} onChange={e => setNewPlant({...newPlant, jalur: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-center bg-white" placeholder="1" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Pohon (No)</label>
                      <input required type="number" value={newPlant.noPohon} onChange={e => setNewPlant({...newPlant, noPohon: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg text-sm font-bold text-center bg-white" placeholder="1" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Koordinat GPS</label>
                    <div className="flex gap-2">
                      <input type="text" value={newPlant.gps} onChange={e => setNewPlant({...newPlant, gps: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-mono bg-gray-50" placeholder="-6.200, 106.816" />
                      <button type="button" onClick={getLocation} className="bg-blue-600 text-white px-4 rounded-xl text-sm font-bold hover:bg-blue-700 whitespace-nowrap flex items-center shadow-md">
                        <MapPin size={16} className="mr-1"/> GPS
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Tanggal Tanam</label>
                    <input required type="date" value={newPlant.tglTanam} onChange={e => setNewPlant({...newPlant, tglTanam: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold" />
                  </div>
                </div>
              </div>

              {/* --- DATA DINAMIS --- */}
              <div>
                <h4 className="font-bold text-green-700 border-b-2 border-green-100 pb-2 mb-4 text-xs uppercase tracking-widest mt-2 flex items-center gap-2"><Activity size={16}/> Data Dinamis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Fase Pertumbuhan</label>
                    <select value={newPlant.fase} onChange={e => setNewPlant({...newPlant, fase: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold">
                      <option value="TBM">Vegetatif (TBM)</option>
                      <option value="TM">Generatif (TM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Status Pohon</label>
                    <select value={newPlant.status} onChange={e => setNewPlant({...newPlant, status: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold">
                      <option value="Sehat">Sehat</option>
                      <option value="Abnormal">Abnormal / Sakit</option>
                      <option value="Mati">Mati</option>
                      <option value="Tambal Sulam">Tambal Sulam (Replant)</option>
                    </select>
                  </div>

                  {/* FORM KHUSUS GENERATIF (TM) */}
                  {newPlant.fase === 'TM' && (
                    <div className="sm:col-span-2 bg-purple-50 p-5 rounded-2xl border border-purple-200 shadow-inner">
                      <h5 className="text-[10px] font-black text-purple-800 uppercase tracking-widest mb-3">Rekap Data Panen</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-purple-900 mb-1.5">Total Panen (Kg)</label>
                          <input type="number" value={newPlant.panenTotal} onChange={e => setNewPlant({...newPlant, panenTotal: e.target.value})} className="w-full p-2.5 border border-purple-200 rounded-lg text-sm bg-white" placeholder="0" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-purple-900">Panen Terakhir</label>
                          <div className="flex gap-2">
                            <input type="date" value={newPlant.panenTgl} onChange={e => setNewPlant({...newPlant, panenTgl: e.target.value})} className="w-1/2 p-2.5 border border-purple-200 rounded-lg text-xs bg-white" />
                            <input type="number" value={newPlant.panenVol} onChange={e => setNewPlant({...newPlant, panenVol: e.target.value})} className="w-1/2 p-2.5 border border-purple-200 rounded-lg text-xs bg-white" placeholder="Vol (Kg)" />
                          </div>
                        </div>
                        <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-purple-200/50 mt-1">
                          <label className="block text-xs font-bold text-purple-900">Prediksi Panen Berikutnya</label>
                          <div className="flex gap-2">
                            <input type="month" value={newPlant.prediksiBlnThn} onChange={e => setNewPlant({...newPlant, prediksiBlnThn: e.target.value})} className="w-1/2 p-2.5 border border-purple-200 rounded-lg text-sm bg-white" />
                            <input type="number" value={newPlant.prediksiVol} onChange={e => setNewPlant({...newPlant, prediksiVol: e.target.value})} className="w-1/2 p-2.5 border border-purple-200 rounded-lg text-sm bg-white" placeholder="Estimasi Vol (Kg)" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FORM KHUSUS TAMBAL SULAM */}
                  {newPlant.status === 'Tambal Sulam' && (
                    <div className="sm:col-span-2 bg-orange-50 p-5 rounded-2xl border border-orange-200 shadow-inner">
                      <h5 className="text-[10px] font-black text-orange-800 uppercase tracking-widest mb-3">Histori Tambal Sulam</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-orange-900 mb-1.5">Tgl Dilakukan</label>
                          <input type="date" value={newPlant.tsTgl} onChange={e => setNewPlant({...newPlant, tsTgl: e.target.value})} className="w-full p-2.5 border border-orange-200 rounded-lg text-sm bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-orange-900 mb-1.5">Varietas Pengganti</label>
                          <input type="text" value={newPlant.tsVarietas} onChange={e => setNewPlant({...newPlant, tsVarietas: e.target.value})} className="w-full p-2.5 border border-orange-200 rounded-lg text-sm bg-white" placeholder="Contoh: Miki" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-orange-900 mb-1.5">Alasan Kematian / Keterangan</label>
                          <input type="text" value={newPlant.tsKeterangan} onChange={e => setNewPlant({...newPlant, tsKeterangan: e.target.value})} className="w-full p-2.5 border border-orange-200 rounded-lg text-sm bg-white" placeholder="Kena jamur akar..." />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Foto Tanaman (Opsional)</label>
                    {!newPlant.photo ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:bg-green-50 transition-colors">
                        <input type="file" accept="image/*" capture="environment" id="plantCameraInput" className="hidden" onChange={(e) => handlePhotoCapture(e, 'plant')}/>
                        <label htmlFor="plantCameraInput" className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
                          <Camera className="text-green-600 mb-2" size={28} />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Buka Kamera HP</span>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img src={newPlant.photo} alt="Preview" className="w-full h-40 object-cover rounded-2xl border border-gray-200 shadow-sm" />
                        <button type="button" onClick={() => setNewPlant({...newPlant, photo: null})} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Catatan Khusus</label>
                    <textarea value={newPlant.notes} onChange={e => setNewPlant({...newPlant, notes: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none resize-none h-20 text-sm" placeholder="Gejala, kondisi fisik khusus..."></textarea>
                  </div>
                </div>
              </div>
            </form>

            <div className="p-4 sm:p-6 border-t border-gray-100 flex gap-3 bg-gray-50">
              <button type="button" onClick={() => setShowAddPlant(false)} className="flex-1 py-4 text-gray-600 bg-white border border-gray-200 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">Batal</button>
              <button form="addPlantForm" type="submit" className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-700 transition-colors flex items-center justify-center">
                <Save size={16} className="mr-2"/> Simpan Tanaman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH LOG */}
      {showAddLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0">
            <h3 className="text-xl font-black text-green-900 mb-6">Input Aktivitas</h3>
            <form onSubmit={handleAddLog} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pilih Pohon</label>
                <select required value={newLog.plantId} onChange={e => setNewLog({...newLog, plantId: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-green-500">
                  <option value="">-- Ketuk Untuk Memilih --</option>
                  {plants.map(p => <option key={p.id} value={p.id}>{p.treeCode} - {p.varietas}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Jenis Aktivitas</label>
                <select required value={newLog.type} onChange={e => setNewLog({...newLog, type: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-xl font-bold text-sm outline-none focus:border-green-500">
                  <option value="">-- Ketuk Untuk Memilih --</option>
                  {activityItems.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Bukti Foto Laporan</label>
                {!newLog.photo ? (
                  <label className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-colors">
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoCapture(e, 'log')}/>
                    <Camera className="text-green-600 mb-2" size={32} />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Buka Kamera HP</span>
                  </label>
                ) : (
                  <div className="relative">
                    <img src={newLog.photo} alt="Preview" className="w-full h-40 object-cover rounded-2xl border border-gray-200 shadow-sm" />
                    <button type="button" onClick={() => setNewLog({...newLog, photo: null})} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Catatan Laporan</label>
                <textarea value={newLog.notes} onChange={e => setNewLog({...newLog, notes: e.target.value})} className="w-full p-3.5 border border-gray-200 rounded-xl text-sm outline-none h-24 focus:border-green-500" placeholder="Kondisi terkini saat aktivitas..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddLog(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 hover:bg-gray-200 rounded-2xl font-bold text-xs uppercase tracking-widest transition-colors">Batal</button>
                <button type="submit" className="flex-[2] py-4 bg-green-600 text-white hover:bg-green-700 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-green-200 transition-colors">Simpan Log</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Blessing */}
      <footer className="py-12 text-center px-4 relative">
        <div className="opacity-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Maju Agro Management V2.2</p>
          <p className="mt-2 text-xs italic font-medium text-green-800">"Sabbe Satta Bhavantu Sukhitatta"</p>
        </div>
        {/* LOGO 3: Footer */}
        <div className="mt-6 mx-auto w-12 h-12 grayscale opacity-30 flex items-center justify-center">
           <img src="logo_footer.png" alt="Logo Footer" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}/>
           <Leaf size={24} className="text-gray-500 hidden" />
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}