import React, { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiX } from 'react-icons/fi'; 

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const ChatWidget = ({ announcements, taPercent, magangPercent }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Halo! Saya asisten akademik (AI) Politeknik Negeri Madiun. Ada yang bisa saya bantu?' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatOpen, isTyping]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    const lowerMsg = userMsg.toLowerCase();
    let localAnswer = null;
    const taLabel = taPercent === 100 ? 'Selesai' : 'Sedang Berlangsung';
    const magangLabel = magangPercent === 100 ? 'Selesai' : 'Sedang Berlangsung';

    // AMBIL FORMAT SAAT TOMBOL SEND DITEKAN (SELALU TERBARU)
    const savedFormatStr = localStorage.getItem('chatbot_format');
    const botFormat = savedFormatStr ? JSON.parse(savedFormatStr) : {
      prefix: "Berdasarkan pengumuman terbaru,",
      suffix: "Terima kasih, semoga membantu!"
    };

    // JAWABAN LOKAL (TA & MAGANG)
    if (lowerMsg.includes('progress ta') || lowerMsg.includes('status ta')) {
        localAnswer = `Progress Tugas Akhir kamu saat ini ${taPercent}% (${taLabel}).`;
    } else if (lowerMsg.includes('progress magang') || lowerMsg.includes('status magang')) {
        localAnswer = `Progress Magang kamu saat ini ${magangPercent}% (${magangLabel}).`;
    }

    if (localAnswer) {
        setTimeout(() => {
            const prefixText = botFormat.prefix ? `${botFormat.prefix}\n\n` : '';
            const suffixText = botFormat.suffix ? `\n\n${botFormat.suffix}` : '';
            setChatHistory(prev => [...prev, { sender: 'bot', text: `${prefixText}${localAnswer}${suffixText}` }]);
            setIsTyping(false);
        }, 800);
        return;
    }

    if (!GEMINI_API_KEY) {
        setIsTyping(false);
        setChatHistory(prev => [...prev, { sender: 'bot', text: 'Sistem sedang gangguan: API Key belum dikonfigurasi.' }]);
        return;
    }

    try {
      const contextData = announcements?.length > 0
        ? announcements.map((a, i) => `[Urutan ${i+1}] ${a.Judul} (Isi: ${a.isi_pengumuman})`).join('\n')
        : "Tidak ada pengumuman saat ini.";

      const storedRules = JSON.parse(localStorage.getItem('chatbot_rules') || '[]');
      let customRulesText = "";
      if (storedRules.length > 0) {
        customRulesText = "ATURAN WAJIB DARI ADMIN:\n";
        storedRules.forEach(rule => {
          customRulesText += `- Jika pertanyaan membahas "${rule.keyword}", patuhi: ${rule.instruction}\n`;
        });
      }

      // 👇 PROMPT SANGAT KETAT 👇
      const prompt = `
        Kamu adalah asisten akademik.
        Tugasmu HANYA menjawab inti pertanyaan.
        
        ATURAN MUTLAK:
        1. JANGAN gunakan kata sapaan/salam.
        2. JANGAN gunakan kalimat penutup/terima kasih.
        3. JANGAN sebutkan progress TA/Magang kecuali ditanya eksplisit.
        4. JIKA ADA BEBERAPA PENGUMUMAN DENGAN TOPIK YANG SAMA, GUNAKAN HANYA PENGUMUMAN YANG PALING BARU (URUTAN NOMOR PALING KECIL/ATAS). Abaikan yang lama.
        5. Langsung berikan inti jawabannya.

        === DATA PENGUMUMAN ===
        ${contextData}

        ${customRulesText}

        PERTANYAAN: "${userMsg}"
        JAWABAN INTI SAJA:
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      
      const coreAnswer = data.candidates[0].content.parts[0].text.trim();

      // PENGGABUNGAN PAKSA OLEH JAVASCRIPT
      const prefixText = botFormat.prefix ? `${botFormat.prefix}\n\n` : '';
      const suffixText = botFormat.suffix ? `\n\n${botFormat.suffix}` : '';
      const finalBotResponse = `${prefixText}${coreAnswer}${suffixText}`;

      setChatHistory(prev => [...prev, { sender: 'bot', text: finalBotResponse }]);

    } catch (error) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: `Gagal terhubung: ${error.message}.` }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none">
      {isChatOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col pointer-events-auto animate-pop-in origin-bottom-right" style={{height: '500px'}}>
          <div className="p-4 flex justify-between items-center bg-blue-600 text-white shadow-md">
            <div className="flex items-center gap-3">
               <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"><FiMessageSquare /></div>
               <div><h4 className="font-bold text-sm">Akademik AI</h4><div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span><p className="text-[10px] text-blue-100">Online</p></div></div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition"><FiX size={20} /></button>
          </div>
          
          <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-4">
             {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`p-3 text-sm max-w-[85%] shadow-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl' : 'bg-white text-gray-800 rounded-tr-2xl rounded-tl-2xl rounded-br-2xl whitespace-pre-line'}`}>{msg.text}</div>
                </div>
             ))}
             {isTyping && <div className="text-xs text-gray-500 italic ml-2">Sedang mengetik...</div>}
             <div ref={chatEndRef}></div>
          </div>
          
          <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-gray-100 flex gap-2">
             <input type="text" className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ketik pesan..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} disabled={isTyping} />
             <button type="submit" disabled={!chatInput.trim() || isTyping} className="bg-blue-600 text-white p-2.5 rounded-xl hover:bg-blue-700 transition shadow-md disabled:bg-blue-300 disabled:cursor-not-allowed"><FiSend /></button>
          </form>
        </div>
      )}

      <button onClick={() => setIsChatOpen(!isChatOpen)} className={`pointer-events-auto p-4 rounded-full shadow-2xl text-white flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-90 ${isChatOpen ? 'bg-red-500 rotate-90' : 'bg-blue-600 rotate-0 hover:bg-blue-700'}`} style={{ width: '60px', height: '60px' }}>
         {isChatOpen ? <FiX size={28} /> : <FiMessageSquare size={28} />}
      </button>
    </div>
  );
};