import React from 'react'
import { PortalOverlay } from '../shared/PortalOverlay'

export default function ApiKeyModal({ show, onClose, userApiKey, onSave }) {
  if (!show) return null
  return (
    <PortalOverlay onClose={onClose} zIndex="z-[10000]">
      <div className="bg-white rounded-2xl p-6 w-full shadow-2xl">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Setup API Key</h3>
        <p className="text-sm text-gray-500 mb-4">Masukkan Google Gemini API Key untuk menggunakan AI.</p>
        <form onSubmit={onSave} className="space-y-4">
          <input 
            type="password" 
            name="apiKey" 
            defaultValue={userApiKey} 
            placeholder="Paste API Key disini..." 
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" 
            required 
          />
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">Simpan</button>
          </div>
        </form>
      </div>
    </PortalOverlay>
  )
}