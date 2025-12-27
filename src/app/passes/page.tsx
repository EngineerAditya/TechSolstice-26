import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {Hourglass} from 'ldrs/react'
import 'ldrs/react/Hourglass.css'

export default async function PassesPage() {
  const supabase = await createClient()

  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get Profile & Admin Status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('id', user.id)
    .single()



const isvisible = false;    //change to true to see passes
  if(!isvisible){
    return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background blur circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl animate-spin"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-spin delay-500"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-spin delay-1000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 max-w-4xl">
        {/* Main heading with shimmer effect */}
        <div className="relative">
          <h1 
              className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]"
              style={{ 
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                paddingBottom: '0.1em' // Add padding to prevent cutoff
              }}
            >
              Coming Soon
            </h1>
        </div>
        
        {/* Subtitle */}
        <p className="text-2xl mt-15 md:text-3xl text-gray-300 font-light tracking-wide">
          Passes Out Soon!
        </p>
        <Hourglass
          size="40"
          bgOpacity="0.1"
          speed="1.75"
          color="cyan" 
        />        

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          <div className="text-cyan-400 text-sm uppercase tracking-widest">Stay Tuned</div>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
else{
  return (
    <div className="min-h-screen bg-transparent text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-white/5 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-500">My Passes</h1>
          <form action="/api/auth/signout" method="post">
            <button className="text-sm font-medium text-gray-400 hover:text-white">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      <main className="px-6 py-8">
        {/* User Welcome Card */}
        <div className="mb-8 rounded-xl bg-gray-900 p-6 border border-gray-800">
          <h2 className="text-lg font-semibold text-white">Hello, {profile?.full_name}</h2>
          <p className="text-sm text-gray-400 mt-1">
            {profile?.is_university_student ? '🎓 Manipal Student' : '🌍 Guest User'}
          </p>
          <p className="text-xs text-gray-500 mt-2 break-all">{profile?.email}</p>

          {/* Admin Button (Only visible if admin) */}
          {admin && (
            <Link
              href="/admin-dashboard"
              className="mt-4 inline-block rounded-lg bg-purple-600/20 px-4 py-2 text-sm font-bold text-purple-400 border border-purple-600/50"
            >
              Access Admin Panel →
            </Link>
          )}
        </div>

        {/* Passes Grid */}
        <h3 className="mb-4 text-xl font-bold">Available Passes</h3>
        <div className="grid gap-6 sm:grid-cols-2">

          {/* Pass Card 1 */}
          <div className="overflow-hidden rounded-2xl bg-gray-900 border border-gray-800">
            <div className="h-32 bg-gradient-to-r from-blue-900 to-blue-600 p-6 flex items-end">
              <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold text-white/90 backdrop-blur-sm">
                MOST POPULAR
              </span>
            </div>
            <div className="p-6">
              <h4 className="text-xl font-bold">All Access Pass</h4>
              <p className="mt-2 text-sm text-gray-400">
                Entry to all workshops, pro-shows, and technical events.
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-2xl font-bold text-white">₹499</span>
                <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-black active:scale-95 transition">
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Pass Card 2 */}
          <div className="overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 opacity-75">
            <div className="h-32 bg-gradient-to-r from-purple-900 to-purple-800 p-6 flex items-end"></div>
            <div className="p-6">
              <h4 className="text-xl font-bold">Pro-Show Only</h4>
              <p className="mt-2 text-sm text-gray-400">
                Entry to the concert night only.
              </p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-2xl font-bold text-white">₹299</span>
                <button className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-bold text-white active:scale-95 transition">
                  Buy Now
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
}