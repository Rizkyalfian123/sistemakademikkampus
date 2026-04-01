import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  FiMessageSquare, FiStar, FiZap, FiCheckSquare, 
  FiBookOpen, FiHelpCircle, FiClock, FiAlertTriangle, 
  FiRefreshCcw, FiSend, FiCpu, FiTrash2, FiUser, FiEdit3, FiSave
} from 'react-icons/fi';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export default function ChatbotTrainingCenterView() {
  const [activeTab, setActiveTab] = useState('training');
  const [trainingData, setTrainingData] = useState('');
  const [isTraining, setIsTraining] = useState(false);

  const [faqs, setFaqs] = useState(() => {
    const savedRules = localStorage.getItem('chatbot_rules');
    return savedRules ? JSON.parse(savedRules) : [];
  });

  const [botFormat, setBotFormat] = useState(() => {
    const savedFormat = localStorage.getItem('chatbot_format');
    return savedFormat ? JSON.parse(savedFormat) : {
      prefix: "Berdasarkan pengumuman terbaru,",
      suffix: "Terima kasih, semoga membantu!"
    };
  });

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'bot', text: 'Halo! Saya AI Asisten Kampus. Coba uji aturan dan format baru saya di sini!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef(null);
  const [history, setHistory] = useState([
    { id: 1, date: new Date().toLocaleString('id-ID'), status: 'Ready', itemsAdded: 0, admin: 'System' }
  ]);

  const kpiData = [
    { icon: <FiMessageSquare size={20} />, value: '12,543', label: 'Total Percakapan', indicator: 'bg-purple-600' },
    { icon: <FiStar size={20} />, value: '94.2%', label: 'Tingkat Kepuasan', indicator: 'bg-green-600' },
    { icon: <FiZap size={20} />, value: '1.2s', label: 'Avg. Response Time', indicator: 'bg-yellow-600' },
    { icon: <FiCheckSquare size={20} />, value: '89.7%', label: 'Success Rate', indicator: 'bg-pink-600' },
  ];

  const tabs = [
    { id: 'training', label: 'Training Data', icon: <FiBookOpen size={18} /> },
    { id: 'test', label: 'Test Chatbot', icon: <FiMessageSquare size={18} /> },
    { id: 'faq', label: 'Rules Management', icon: <FiHelpCircle size={18} /> },
    { id: 'history', label: 'Training History', icon: <FiClock size={18} /> },
  ];

  useEffect(() => {
    if (activeTab === 'test' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, isBotTyping]);

  const handleSaveFormat = () => {
    localStorage.setItem('chatbot_format', JSON.stringify(botFormat));
    setHistory([{ id: Date.now(), date: new Date().toLocaleString('id-ID'), status: 'Format Update', itemsAdded: 0, admin: 'Admin User' }, ...history]);
    alert("Gaya bahasa chatbot berhasil disimpan ke sistem.");
  };

  const handleTrainModel = () => {
    if (!trainingData.trim()) return alert("Kotak aturan masih kosong!");
    setIsTraining(true);
    
    setTimeout(() => {
      const lines = trainingData.split('\n');
      let currentRules = [...faqs]; // Ambil aturan yang ada saat ini
      let addedCount = 0;
      
      lines.forEach(line => {
        if (line.includes('|')) {
          const [kw, inst] = line.split('|');
          const cleanKw = kw.trim().toLowerCase();
          
          if (cleanKw && inst.trim()) {
            // 👇 LOGIKA OVERWRITE: Hapus aturan lama jika kata kuncinya sama persis
            currentRules = currentRules.filter(r => r.keyword !== cleanKw);
            
            // Tambahkan aturan baru ke paling atas (unshift)
            currentRules.unshift({ id: Date.now() + Math.random(), keyword: cleanKw, instruction: inst.trim() });
            addedCount++;
          }
        }
      });

      if (addedCount > 0) {
        setFaqs(currentRules);
        localStorage.setItem('chatbot_rules', JSON.stringify(currentRules));
        setHistory([{ id: Date.now(), date: new Date().toLocaleString('id-ID'), status: 'Rules Update', itemsAdded: addedCount, admin: 'Admin User' }, ...history]);
        alert(`Berhasil memperbarui ${addedCount} aturan! (Kata kunci yang sama telah ditimpa dengan yang baru).`);
        setTrainingData('');
      } else {
        alert("Gagal. Pastikan formatnya: Kata Kunci | Instruksi");
      }
      setIsTraining(false);
    }, 800);
  };

  const handleDeleteFaq = (id) => {
    if(window.confirm("Yakin ingin menghapus aturan ini?")) {
      const updatedRules = faqs.filter(f => f.id !== id);
      setFaqs(updatedRules);
      localStorage.setItem('chatbot_rules', JSON.stringify(updatedRules)); 
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsBotTyping(true);

    try {
      if (!GEMINI_API_KEY) throw new Error("API Key belum disetting!");

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

      const { data: pengumuman } = await supabase.from('Pengumuman').select('Judul, isi_pengumuman').order('created_at', { ascending: false });
      
      let konteksPengumuman = "Tidak ada pengumuman.";
      if (pengumuman && pengumuman.length > 0) {
        konteksPengumuman = pengumuman.map((p, i) => `[Urutan ${i+1}] ${p.Judul} (Isi: ${p.isi_pengumuman})`).join('\n');
      }

      let customRulesText = "";
      if (faqs.length > 0) {
        customRulesText = "ATURAN WAJIB DARI ADMIN:\n";
        faqs.forEach(rule => {
          customRulesText += `- Jika pertanyaan tentang "${rule.keyword}", patuhi: ${rule.instruction}\n`;
        });
      }

      // 👇 PROMPT SANGAT KETAT 👇
      const prompt = `
        Kamu adalah asisten akademik.
        Tugasmu HANYA menjawab inti pertanyaan.
        
        ATURAN MUTLAK:
        1. JANGAN gunakan kata sapaan/salam.
        2. JANGAN gunakan kalimat penutup/terima kasih.
        3. JIKA ADA BEBERAPA PENGUMUMAN DENGAN TOPIK YANG SAMA, GUNAKAN HANYA PENGUMUMAN YANG PALING BARU (URUTAN NOMOR PALING KECIL/ATAS). Abaikan yang lama.
        4. Langsung berikan inti jawabannya.

        === DATA PENGUMUMAN ===
        ${konteksPengumuman}

        ${customRulesText}

        PERTANYAAN: "${userMsg.text}"
        JAWABAN INTI SAJA:
      `;

      const result = await model.generateContent(prompt);
      const coreAnswer = result.response.text().trim(); 

      // PENGGABUNGAN PAKSA OLEH JAVASCRIPT
      const prefixText = botFormat.prefix ? `${botFormat.prefix}\n\n` : '';
      const suffixText = botFormat.suffix ? `\n\n${botFormat.suffix}` : '';
      const finalBotResponse = `${prefixText}${coreAnswer}${suffixText}`;

      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: finalBotResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: `⚠️ ${error.message}` }]);
    } finally {
      setIsBotTyping(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6 animate-pop-in pb-10">
      <style>{`
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        .animate-pop-in { animation: popIn 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .chat-bubble-user { border-radius: 20px 20px 0 20px; }
        .chat-bubble-bot { border-radius: 20px 20px 20px 0; }
        .typing-dot { animation: typing 1.4s infinite ease-in-out both; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-xl"><FiCpu size={24} /></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">AI Training Center</h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Atur instruksi custom & gaya bahasa AI Asisten</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpiData.map((kpi, idx) => <KpiCard key={idx} icon={kpi.icon} iconBg="bg-white text-gray-700" value={kpi.value} label={kpi.label} indicator={kpi.indicator} />)}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[500px]">
        <div className="flex border-b border-gray-100 mb-6 gap-6 overflow-x-auto custom-scrollbar">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 pb-3 px-1 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-blue-500'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'training' && (
          <div className="animate-pop-in space-y-6 flex-1 flex flex-col">
            
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
              <h3 className="text-[13px] font-bold text-blue-800 mb-4 flex items-center gap-2"><FiEdit3 /> Pengaturan Gaya Bahasa Chatbot</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Awalan Kalimat</label>
                  <input type="text" value={botFormat.prefix} onChange={e => setBotFormat({...botFormat, prefix: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="P, inpo terbaru nih" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Akhiran Kalimat</label>
                  <input type="text" value={botFormat.suffix} onChange={e => setBotFormat({...botFormat, suffix: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Gausah bilang makasih brok" />
                </div>
              </div>
              <button onClick={handleSaveFormat} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
                <FiSave /> Simpan Gaya Bahasa
              </button>
            </div>

            <hr className="border-gray-100" />

            <div>
              <h3 className="text-lg font-bold text-gray-800">Update Aturan Chatbot</h3>
              <p className="text-sm text-gray-500 font-medium mt-1">Berikan instruksi khusus. Format: Kata Kunci | Instruksi</p>
            </div>
            <textarea 
              value={trainingData} 
              onChange={(e) => setTrainingData(e.target.value)} 
              placeholder="Contoh:\nbayar ukt | Arahkan mahasiswa ke gedung rektorat" 
              className="w-full flex-1 min-h-[150px] p-6 bg-gray-50 border border-gray-200 rounded-2xl text-[14px] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none custom-scrollbar" 
            />
            <div className="flex gap-3">
              <button onClick={handleTrainModel} disabled={isTraining} className="flex-1 bg-blue-600 text-white font-bold px-6 py-3.5 rounded-xl shadow-md hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
                <FiRefreshCcw className={isTraining ? 'animate-spin' : ''}/> Simpan Aturan Baru
              </button>
              <button onClick={() => setTrainingData('')} className="px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200">Reset Text</button>
            </div>

          </div>
        )}

        {activeTab === 'test' && (
          <div className="animate-pop-in flex-1 flex flex-col h-full border border-gray-100 rounded-2xl overflow-hidden bg-gray-50">
            <div className="bg-white p-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><FiCpu size={20}/></div>
                 <div>
                   <h3 className="font-bold text-sm text-gray-800">Kampus AI (Test Mode)</h3>
                   <div className="flex items-center gap-1.5 mt-0.5"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><span className="text-[10px] text-gray-500 font-semibold">Online</span></div>
                 </div>
               </div>
               <button onClick={() => setChatMessages([{ id: 1, sender: 'bot', text: 'Uji coba chatbot dibersihkan.' }])} className="text-xs text-gray-400 hover:text-red-500 font-bold px-3 py-1.5 border border-gray-200 rounded-lg bg-white transition-all">Clear Chat</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar max-h-[400px]">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                   <div className="flex items-end gap-2 mb-1">
                      {msg.sender === 'bot' && <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0"><FiCpu size={12}/></div>}
                      <div className={`p-3.5 text-[13px] leading-relaxed shadow-sm whitespace-pre-line ${msg.sender === 'user' ? 'bg-blue-600 text-white chat-bubble-user' : 'bg-white text-gray-800 border border-gray-100 chat-bubble-bot'}`}>{msg.text}</div>
                   </div>
                </div>
              ))}
              {isBotTyping && (
                <div className="flex flex-col max-w-[85%] mr-auto items-start">
                  <div className="flex items-end gap-2 mb-1">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0"><FiCpu size={12}/></div>
                    <div className="p-4 bg-white border border-gray-100 chat-bubble-bot flex gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div><div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div><div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isBotTyping} placeholder="Tanyakan sesuatu ke chatbot..." className="flex-1 bg-gray-50 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-100 transition-all disabled:opacity-50" />
              <button type="submit" disabled={!chatInput.trim() || isBotTyping} className="bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"><FiSend size={18} /></button>
            </form>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="animate-pop-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-gray-50 border border-gray-200 p-5 rounded-2xl flex flex-col group relative">
                  <button onClick={() => handleDeleteFaq(faq.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"><FiTrash2 size={16} /></button>
                  <h4 className="font-bold text-[13px] text-gray-800 pr-8 mb-3 flex gap-2"><span className="text-blue-500 whitespace-nowrap">Kata Kunci:</span> <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{faq.keyword}</span></h4>
                  <p className="text-[12px] text-gray-600 flex flex-col gap-1 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 flex-1"><span className="text-green-500 font-bold mb-1">Instruksi ke AI:</span> {faq.instruction}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-pop-in space-y-6">
            <div className="overflow-x-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead><tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500 border-b border-gray-100"><th className="p-4 font-bold">Waktu Update</th><th className="p-4 font-bold">Admin</th><th className="p-4 font-bold">Aktivitas</th><th className="p-4 font-bold">Status</th></tr></thead>
                <tbody className="text-sm text-gray-700">
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-gray-50">
                      <td className="p-4 font-medium">{h.date}</td>
                      <td className="p-4">{h.admin}</td>
                      <td className="p-4">{h.itemsAdded > 0 ? `+ ${h.itemsAdded} aturan` : 'Update Format'}</td>
                      <td className="p-4"><span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold border border-green-100">{h.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const KpiCard = ({ icon, iconBg, value, label, indicator }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>{icon}</div>
    <div className={`absolute top-6 right-6 w-2.5 h-2.5 rounded-full ${indicator} ring-4 ring-white`}></div>
    <h3 className="text-3xl font-black text-gray-800 mt-6 mb-1">{value}</h3>
    <p className="text-sm text-gray-500 font-medium">{label}</p>
  </div>
);