import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiX, FiKey } from 'react-icons/fi';

export const ChatWidget = ({ announcements, taPercent, magangPercent }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Halo! Saya asisten akademik (AI) dengan model Gemini 2.5 Flash. Ada yang bisa saya bantu?' }
  ]);
  const [userApiKey, setUserApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const chatEndRef = useRef(null);

  // Load API Key
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setUserApiKey(storedKey);
  }, []);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatOpen, isTyping]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    const inputKey = e.target.apiKey.value.trim();
    if (!inputKey) return alert("API Key tidak boleh kosong!");
    setUserApiKey(inputKey);
    localStorage.setItem('gemini_api_key', inputKey);
    setShowKeyModal(false);
    setChatHistory(prev => [...prev, { sender: 'bot', text: 'API Key tersimpan! Sekarang saya siap digunakan.' }]);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    // Cek Jawaban Lokal
    const lowerMsg = userMsg.toLowerCase();
    let localAnswer = null;
    const taLabel = taPercent === 100 ? 'Selesai' : 'Sedang Berlangsung';
    const magangLabel = magangPercent === 100 ? 'Selesai' : 'Sedang Berlangsung';

    if (lowerMsg.includes('progress ta') || lowerMsg.includes('status ta')) {
        localAnswer = `Progress Tugas Akhir kamu saat ini ${taPercent}% (${taLabel}).`;
    } else if (lowerMsg.includes('progress magang') || lowerMsg.includes('status magang')) {
        localAnswer = `Progress Magang kamu saat ini ${magangPercent}% (${magangLabel}).`;
    }

    if (localAnswer) {
        setTimeout(() => {
            setChatHistory(prev => [...prev, { sender: 'bot', text: localAnswer }]);
            setIsTyping(false);
        }, 800);
        return;
    }

    if (!userApiKey) {
        setIsTyping(false);
        setShowKeyModal(true);
        setChatHistory(prev => [...prev, { sender: 'bot', text: 'Silakan masukkan Google Gemini API Key Anda terlebih dahulu.' }]);
        return;
    }

    // Call API Gemini
    try {
      const contextData = announcements?.length > 0
        ? announcements.map((a, i) => `[${i+1}] ${a.Judul} (Isi: ${a.isi_pengumuman})`).join('\n')
        : "Tidak ada pengumuman saat ini.";

      const prompt = `
        Kamu adalah asisten akademik Politeknik Negeri Madiun.
        DATA PENGUMUMAN KAMPUS: ${contextData}
        DATA PROGRESS MAHASISWA: TA: ${taPercent}% | Magang: ${magangPercent}%
        PERTANYAAN: "${userMsg}"
        INSTRUKSI: Jawab ramah, singkat, dan jelas.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${userApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const aiResponse = data.candidates[0].content.parts[0].text;
      setChatHistory(prev => [...prev, { sender: 'bot', text: aiResponse }]);

    } catch (error) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: `Gagal terhubung: ${error.message}. Periksa API Key.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      {/* Modal API Key Inline */}
      {showKeyModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-auto" style={{ zIndex: 10000 }}>
          <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={() => setShowKeyModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md animate-pop-in">
             <div className="flex items-center gap-3 mb-4 text-blue-600"><FiKey size={24} /><h3 className="text-xl font-bold">Setup Chatbot AI</h3></div>
             <form onSubmit={handleSaveApiKey}>
                <input type="password" name="apiKey" defaultValue={userApiKey} placeholder="Masukkan API Key..." className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-4"/>
                <div className="flex gap-3">
                   <button type="button" onClick={() => setShowKeyModal(false)} className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold">Batal</button>
                   <button type="submit" className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg">Simpan</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto animate-pop-in origin-bottom-right" style={{height: '500px'}}>
          <div className="p-4 flex justify-between items-center bg-blue-600 text-white shadow-md">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"><FiMessageSquare /></div>
               <div><h4 className="font-bold text-sm">Akademik AI</h4><div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span><p className="text-[10px] text-blue-100">Online</p></div></div>
            </div>
            <div className="flex gap-1">
               <button onClick={() => setShowKeyModal(true)} className="hover:bg-white/20 p-1.5 rounded-full transition" title="Set API Key"><FiKey size={18} /></button>
               <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition"><FiX size={20} /></button>
            </div>
          </div>
          <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
             {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`p-3 text-sm max-w-[85%] shadow-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : 'bg-white text-gray-800 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl'}`}>{msg.text}</div>
                </div>
             ))}
             {isTyping && <div className="text-xs text-gray-500 italic ml-2">Sedang mengetik...</div>}
             <div ref={chatEndRef}></div>
          </div>
          <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-gray-100 flex gap-2">
             <input type="text" className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ketik pesan..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
             <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow-md"><FiSend /></button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button onClick={() => setIsChatOpen(!isChatOpen)} className={`pointer-events-auto p-4 rounded-full shadow-2xl text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-90 ${isChatOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600 rotate-0 hover:bg-blue-700'}`} style={{ width: '60px', height: '60px' }}>
         {isChatOpen ? <FiX size={28} /> : <FiMessageSquare size={28} />}
      </button>
    </div>
  );
};