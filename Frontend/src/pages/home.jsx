import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, CheckCircle2, FolderKanban, MessageSquareText, BarChart3, 
  Sparkles, Layers, ShieldCheck, Zap, Users, ChevronRight, Activity 
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: FolderKanban,
    title: "Kanban & Task Systems",
    description: "Multi-layered task board with spring motion drag states, priority badges, and instant filters.",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-500"
  },
  {
    icon: MessageSquareText,
    title: "Real-time Messaging",
    description: "Channels, direct messaging, and quick team updates kept right next to active project files.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-500"
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Live velocity tracking, completion ratios, and automated team performance reports.",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-500"
  }
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-orange-500 selection:text-white overflow-x-hidden">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none bg-mesh-pattern opacity-80" />
      <div className="fixed inset-0 pointer-events-none bg-grid-dots opacity-30" />

      {/* Header */}
      <header className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <button 
          onClick={() => navigate("/")} 
          className="flex items-center gap-3 text-left focus:outline-none group"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-orange-400 font-extrabold text-white shadow-lg shadow-orange-500/30 transition-transform group-hover:scale-105">
            <span className="text-lg">S</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">Syncly</span>
        </button>

        <div className="flex items-center gap-4 text-sm font-semibold">
          <button
            onClick={() => navigate("/signin")}
            className="text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Sign in
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/signup")}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 font-bold text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
          >
            <span>Get Started</span>
            <ArrowRight size={16} />
          </motion.button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-24 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400 backdrop-blur-md"
          >
            <Sparkles size={14} className="animate-pulse text-orange-400" />
            <span>Next Generation Team Coordination Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl sm:leading-[1.1]"
          >
            A calmer, hyper-focused way to run project delivery.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Syncly brings project taskboards, real-time messaging, member status, and automated metrics into one cohesive, beautifully orchestrated workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 font-bold text-white shadow-xl shadow-orange-500/30 hover:bg-orange-600 transition-all text-base"
            >
              <span>Create Workspace</span>
              <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/signin")}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 font-semibold text-slate-200 hover:border-slate-500 transition-all text-base backdrop-blur-md"
            >
              <span>Explore Demo</span>
              <ChevronRight size={18} className="text-slate-400" />
            </motion.button>
          </motion.div>
        </div>

        {/* Live UI Mockup Preview Frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 rounded-2xl border border-slate-800/80 bg-slate-900/90 p-3 shadow-2xl shadow-orange-500/10 backdrop-blur-2xl"
        >
          <div className="rounded-xl border border-slate-800 bg-[#0e1422] p-4 sm:p-6 overflow-hidden">
            {/* Fake App Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-semibold text-slate-500">Syncly Pro Workspace — Sprint Board 2026</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                <Activity size={13} className="animate-pulse" /> Live Dynamic Feed
              </div>
            </div>

            {/* Fake Dashboard Metric Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Active Projects", value: "14", change: "+2 this week", color: "text-orange-400" },
                { label: "Tasks Completed", value: "128", change: "94% target hit", color: "text-emerald-400" },
                { label: "Team Velocity", value: "98.4%", change: "+4.2% efficiency", color: "text-blue-400" },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
                  <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
                  <p className="text-[11px] font-semibold text-slate-500 mt-1">{stat.change}</p>
                </div>
              ))}
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feat, index) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={feat.title}
                    whileHover={{ y: -4 }}
                    className="spotlight-card rounded-xl border border-slate-800 bg-slate-900/40 p-5 hover:border-slate-700 transition-all"
                  >
                    <div className={`inline-flex rounded-xl p-3 bg-gradient-to-br ${feat.gradient} mb-4`}>
                      <Icon className={`h-6 w-6 ${feat.iconColor}`} />
                    </div>
                    <h3 className="text-base font-bold text-white">{feat.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{feat.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Footer Guarantee */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> End-to-end Socket Synchronization</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> Integrated Admin & Permission Audit</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> Zero Configuration Setup</span>
        </div>
      </main>
    </div>
  );
};

export default Home;
