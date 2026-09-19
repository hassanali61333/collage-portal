import { useRouter } from 'next/navigation';

export default function Header() {

  const router = useRouter();
  return (
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-lg">
            🏛️
          </div>
          <div className="flex items-center gap-3">
            <div>
               <p className="text-sm font-bold leading-tight">
            Abdullah Model College
            </p>
            <p className="text-xs text-white/40 leading-tight">
              Islamabad, Pakistan
            </p>
            </div>
           
           <button onClick={()=> router.push("/")} className="rounded-full bg-gray-700 border pt-3 border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/30">
            Home
          </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          
          
          <button onClick={()=> router.push("/signup")} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/30">
            Signup
          </button>
          <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400">
            Get Access
          </button>
        </div>
      </header>
  );
} 