import { Link, Navigate } from 'react-router-dom';

export default function Home() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Immediately redirect authenticated users to their correct initial landing view
  if (token) {
    if (user.role === 'Client') return <Navigate to="/gigs" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <section className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 p-10 sm:p-20 text-center mt-10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#393bc6]/5 to-[#00cc99]/5 z-0" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 tracking-tight mb-6">
          Find a freelancer. <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#393bc6] to-[#00cc99]">
            Or become one.
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
          HustleHub+ connects clients with premium freelancers for design, tutoring, writing and more. Experience the new standard of collaboration.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-[#393bc6] hover:bg-[#2e30a8] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-[#00cc99] text-[#00cc99] hover:bg-[#00cc99] hover:text-white font-semibold rounded-full shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Create an account
          </Link>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <li className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-[#393bc6]/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-[#393bc6] font-bold text-xl">1</span>
            </div>
            <strong className="block text-lg text-gray-900 mb-2">Clients</strong>
            <span className="text-gray-600">Browse gigs and book exactly the talent you need.</span>
          </li>
          <li className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-[#00cc99]/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-[#00cc99] font-bold text-xl">2</span>
            </div>
            <strong className="block text-lg text-gray-900 mb-2">Freelancers</strong>
            <span className="text-gray-600">Post gigs and track your bookings and income easily.</span>
          </li>
          <li className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-12 h-12 bg-[#ff355e]/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-[#ff355e] font-bold text-xl">3</span>
            </div>
            <strong className="block text-lg text-gray-900 mb-2">Admins</strong>
            <span className="text-gray-600">Manage every gig on the platform with full oversight.</span>
          </li>
        </ul>
      </div>
    </section>
  );
}