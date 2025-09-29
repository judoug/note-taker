import Link from "next/link";
import { currentUser } from '@clerk/nextjs/server';
import { 
  Brain, 
  Sparkles, 
  Search, 
  Tag, 
  Shield, 
  Zap,
  BookOpen,
  Users,
  TrendingUp,
  Check,
  ArrowRight,
  Github,
  Twitter
} from 'lucide-react';

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Note Taker
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#benefits" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Benefits
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                href="/notes"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                Open Notes
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                >
                  Start Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <section className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Advanced AI
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              Your{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              Note-Taking Assistant
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your thoughts into organized, searchable notes with the power of artificial intelligence. 
              Generate content from prompts, get smart suggestions, and never lose an important idea again.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              {user ? (
                <Link
                  href="/notes"
                  className="group inline-flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Open Your Notes
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up"
                    className="group inline-flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start Taking Smart Notes
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className="inline-flex items-center px-8 py-4 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:border-gray-400 hover:text-gray-900 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure & Private
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Lightning Fast
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Trusted by Students & Professionals
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Powerful Features for Modern Note-Taking
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Experience the future of productivity with AI-enhanced note management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* AI Generation */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Note Generation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Transform simple prompts into comprehensive, well-structured notes using advanced AI technology. 
                  Choose from different tones and lengths to match your needs.
                </p>
              </div>

              {/* Smart Search */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 border border-purple-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Intelligent Search</h3>
                <p className="text-gray-600 leading-relaxed">
                  Find any note instantly with powerful search capabilities. Search by content, tags, 
                  or even concepts using our AI-powered semantic search.
                </p>
              </div>

              {/* Smart Tagging */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Auto-Tagging</h3>
                <p className="text-gray-600 leading-relaxed">
                  Let AI automatically suggest and apply relevant tags to organize your notes. 
                  Build a smart, searchable knowledge base effortlessly.
                </p>
              </div>

              {/* Real-time Sync */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-300 border border-orange-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600 leading-relaxed">
                  Experience instant note creation, editing, and synchronization. 
                  Your notes are always up-to-date and accessible when you need them.
                </p>
              </div>

              {/* Secure & Private */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition-all duration-300 border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your notes are encrypted and secured with enterprise-grade security. 
                  We never share your data and you maintain full control.
                </p>
              </div>

              {/* Knowledge Base */}
              <div className="group p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-all duration-300 border border-teal-100">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Knowledge Base</h3>
                <p className="text-gray-600 leading-relaxed">
                  Build a comprehensive knowledge base that grows with you. 
                  Connect ideas, reference past notes, and create meaningful knowledge networks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Why Choose AI Note Taker?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Join thousands of students, professionals, and researchers who have transformed 
                  their note-taking workflow with our AI-powered platform.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Save 3+ Hours Weekly</h3>
                      <p className="text-gray-600">Reduce note-taking time by 75% with AI-generated content and smart organization.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Never Lose Important Ideas</h3>
                      <p className="text-gray-600">Advanced search and AI tagging ensure you can always find what you&apos;re looking for.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Boost Productivity by 40%</h3>
                      <p className="text-gray-600">Streamlined workflow and intelligent features help you focus on what matters most.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Learn Faster & Retain More</h3>
                      <p className="text-gray-600">AI-enhanced note structure improves comprehension and long-term retention.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Productivity Metrics</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Time Saved</span>
                        <span className="text-sm font-semibold text-green-600">+75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Note Quality</span>
                        <span className="text-sm font-semibold text-blue-600">+85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Organization</span>
                        <span className="text-sm font-semibold text-purple-600">+90%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style={{width: '90%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Note-Taking?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already revolutionized their productivity with AI-powered notes.
            </p>
            
            {user ? (
              <Link
                href="/notes"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-white text-blue-600 font-semibold text-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Open Your Notes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-white text-blue-600 font-semibold text-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Start Your Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            )}
            
            <p className="text-blue-100 text-sm mt-4">
              No credit card required • Free forever plan available
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">AI Note Taker</span>
              </div>
              <p className="text-gray-400 text-sm">
                The future of intelligent note-taking, powered by advanced AI technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Benefits</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 AI Note Taker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
