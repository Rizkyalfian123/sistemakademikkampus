import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { FiLock, FiUser, FiLoader, FiMail, FiArrowRight } from 'react-icons/fi'

export default function Login() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      // 1. Tentukan Login via Email atau Username
      const isEmail = identifier.includes('@')
      const columnToSearch = isEmail ? 'Email' : 'Username'

      // 2. Cari User di Database
      const { data: userData, error } = await supabase
        .from('user')
        .select('*')
        .eq(columnToSearch, identifier)
        .single()

      // 3. Validasi Akun
      if (error || !userData) {
        throw new Error('Akun tidak ditemukan. Cek Username/Email Anda.')
      }

      // 4. Cek Password
      if (userData.Password !== password) {
        throw new Error('Password salah!')
      }

      // 5. Simpan Sesi
      const sessionData = {
        id: userData.id,
        email: userData.Email,
        name: userData.Username,
        role: userData.Role,
        avatar: null
      }

      localStorage.setItem('user_akademik', JSON.stringify(sessionData))
      
      // 6. Redirect ke Dashboard
      navigate('/dashboard', { replace: true })

    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    // CONTAINER UTAMA: Gradient Background Gelap (Tailwind v2 Friendly)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden font-sans">
      
      {/* DEKORASI BACKGROUND (Lingkaran Hiasan) */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse transform -translate-x-10 -translate-y-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse transform translate-x-10 translate-y-10"></div>

      {/* KARTU LOGIN */}
      <div className="w-full max-w-md z-10 p-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 duration-500">
          
          {/* Header Kartu: Gradient & Icon */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center relative overflow-hidden">
            {/* Hiasan circle kecil di header */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full transform translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-10 rounded-full transform -translate-x-5 translate-y-5"></div>
            
            <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white border-opacity-30">
              <FiUser className="text-white text-4xl" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-wide">SIAKAD</h2>
            <p className="text-blue-100 text-sm mt-2 opacity-90">Sistem Informasi Akademik</p>
          </div>

          {/* Form Area */}
          <div className="p-8 bg-white">
            
            {/* Pesan Error */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r shadow-sm flex items-center">
                <span className="font-bold mr-2">Oops!</span> {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Input: Username / Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 ml-1">Username / Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {identifier.includes('@') ? 
                      <FiMail className="text-blue-500 text-lg group-focus-within:text-blue-600 transition-colors" /> : 
                      <FiUser className="text-gray-400 text-lg group-focus-within:text-blue-600 transition-colors" />
                    }
                  </div>
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 font-medium"
                    placeholder="Masukan ID Anda..."
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {/* Input: Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-600 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400 text-lg group-focus-within:text-purple-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400 font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Tombol Login Gradient */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 100%)', // Blue to Purple
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <FiLoader className="animate-spin text-xl" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>Masuk Sekarang</span>
                    <FiArrowRight className="text-xl" />
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Lupa kata sandi? <button className="text-blue-600 font-bold hover:underline focus:outline-none">Bantuan</button>
              </p>
            </div>

          </div>
        </div>
        
        {/* Footer Kecil */}
        <p className="text-center text-gray-500 text-xs mt-6 opacity-60">
          © 2024 Politeknik Negeri. All Rights Reserved.
        </p>
      </div>
    </div>
  )
}