import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowRight, 
  GraduationCap, 
  Building2, 
  Users, 
  Shield, 
  CheckSquare, 
  TrendingUp,
  Search,
  CheckCircle2,
  Bookmark,
  FileText,
  UserCheck,
  ClipboardList,
  Eye,
  Check,
  Lock,
  Archive
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import studentsRoleImage from '../../assets/students-role.jpg';
import recruitersRoleImage from '../../assets/recruiters-role.png';
import placementRoleImage from '../../assets/placement-role.jpg';
import HeroIllustration from '../../components/HeroIllustration';

// Reusable motion settings for reversible animations
const customEase = [0.16, 1, 0.3, 1]; // Smooth editorial easing

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: customEase } }
};

const fadeDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: customEase } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const fadeItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: customEase } }
};

const viewportSettings = { once: false, amount: 0.15, margin: "0px 0px -100px 0px" };

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Very subtle parallax transforms (tied to absolute scroll position, smoothly interpolated by framer-motion)
  // We apply these specifically to the visual mocks
  const parallaxYUp = useTransform(scrollY, [0, 3000], [0, -40]);
  const parallaxYDown = useTransform(scrollY, [0, 3000], [0, 40]);

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base text-content font-sans overflow-x-hidden">
      {/* 1. HEADER / NAVIGATION */}
      <header className="h-20 px-6 md:px-12 flex items-center justify-between border-b border-border-light bg-surface sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-2xl font-serif font-bold tracking-tight text-navy">
            Career<span className="text-primary">Bridge</span>
          </button>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-content-muted">
          <a href="#hero" onClick={(e) => handleScroll(e, 'hero')} className="text-navy font-semibold border-b-2 border-primary py-1">Home</a>
          <a href="#students-section" onClick={(e) => handleScroll(e, 'students-section')} className="hover:text-primary transition-colors duration-200">For Students</a>
          <a href="#recruiters-section" onClick={(e) => handleScroll(e, 'recruiters-section')} className="hover:text-primary transition-colors duration-200">For Recruiters</a>
          <a href="#placement-section" onClick={(e) => handleScroll(e, 'placement-section')} className="hover:text-primary transition-colors duration-200">For Placement Cells</a>
        </nav>
        <div>
          {user ? (
            <Button variant="primary" onClick={() => navigate(`/${user.role.toLowerCase()}/dashboard`)}>
              Enter Portal
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="outline" className="hidden sm:inline-flex border-border-light text-navy hover:bg-base transition-colors duration-200" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="primary" className="shadow-sm hover:-translate-y-0.5 transition-transform duration-200" onClick={() => navigate('/login')}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        {/* 2. HERO */}
        <div className="relative overflow-hidden w-full bg-[#F7F5F0] border-b border-border-light min-h-[600px] flex items-center isolate">
          <HeroIllustration />
          
          <section id="hero" className="relative w-full pt-16 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div 
              className="flex-1 z-10 text-center lg:text-left"
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              variants={staggerContainer}
            >
              <motion.div variants={fadeItem} className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-6">
                Institutional Recruitment Platform
              </motion.div>

              <motion.h1 variants={fadeItem} className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-6 text-navy leading-[1.1]">
                Build your career.<br />
                <span className="text-primary">Bridge</span> opportunities.
              </motion.h1>

              <motion.p variants={fadeItem} className="text-lg md:text-xl text-content-muted font-medium mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                A unified platform connecting students, company recruiters, and placement cells to make the recruitment process transparent, efficient, and impactful.
              </motion.p>

              <motion.div variants={fadeItem} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {user ? (
                  <Button variant="primary" size="lg" className="px-8 shadow-sm hover:-translate-y-0.5 transition-transform duration-200" onClick={() => navigate(`/${user.role.toLowerCase()}/dashboard`)}>
                    Enter Portal <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Button variant="primary" size="lg" className="px-8 shadow-sm hover:-translate-y-0.5 transition-transform duration-200" onClick={() => navigate('/login')}>
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" size="lg" className="px-8 border-border-light text-navy hover:bg-surface transition-colors duration-200" onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>
            
            {/* The right side is occupied by the background HeroIllustration. We leave a flex-1 spacer here to maintain layout on desktop. */}
            <div className="flex-1 hidden lg:block" />
          </section>
        </div>

        {/* 3. THREE ROLE CARDS */}
        <section className="py-16 px-6 md:px-12 relative z-20">
          <motion.div 
            className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            variants={staggerContainer}
          >
            {/* Student Card */}
            <motion.div variants={fadeItem} className="flex flex-col p-8 rounded-2xl bg-surface border border-border-light shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-base rounded-full flex items-center justify-center mb-6 border border-border-light">
                <GraduationCap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4 text-navy tracking-tight">For Students</h3>
              <ul className="text-sm text-content-muted mb-8 space-y-3 flex-1">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Browse approved opportunities</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Check eligibility before applying</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Apply directly to suitable jobs</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Save opportunities for later</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Track application progress</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Manage your profile and resume</li>
              </ul>
              <div className="flex items-center text-primary font-semibold text-sm hover:text-primary-dark transition-colors cursor-pointer group" onClick={(e) => handleScroll(e, 'students-section')}>
                Learn More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Recruiter Card */}
            <motion.div variants={fadeItem} className="flex flex-col p-8 rounded-2xl bg-surface border border-border-light shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-12 h-12 bg-base rounded-full flex items-center justify-center mb-6 border border-border-light">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4 text-navy tracking-tight">For Recruiters</h3>
              <ul className="text-sm text-content-muted mb-8 space-y-3 flex-1">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Create and manage company profile</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Publish job opportunities</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Define specific eligibility criteria</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Review student applicants</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Manage the entire hiring pipeline</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Update candidate hiring status</li>
              </ul>
              <div className="flex items-center text-primary font-semibold text-sm hover:text-primary-dark transition-colors cursor-pointer group" onClick={(e) => handleScroll(e, 'recruiters-section')}>
                Learn More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* Placement Cells Card */}
            <motion.div variants={fadeItem} className="flex flex-col p-8 rounded-2xl bg-surface border border-border-light shadow-sm hover:shadow-md transition-shadow duration-300 md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-base rounded-full flex items-center justify-center mb-6 border border-border-light">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-4 text-navy tracking-tight">For Placement Cells</h3>
              <ul className="text-sm text-content-muted mb-8 space-y-3 flex-1">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Review company registrations</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Approve or reject companies</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Review incoming job postings</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Approve or reject opportunities</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Maintain institutional oversight</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> Preserve transparent audit history</li>
              </ul>
              <div className="flex items-center text-primary font-semibold text-sm hover:text-primary-dark transition-colors cursor-pointer group" onClick={(e) => handleScroll(e, 'placement-section')}>
                Learn More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 4. CORE PLATFORM CAPABILITIES */}
        <section className="py-20 px-6 md:px-12 bg-surface border-y border-border-light">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              variants={fadeUp}
            >
              <div className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4">
                A Trusted Recruitment Ecosystem
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy">
                Built for a fair and transparent process.
              </h2>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 text-center sm:text-left" 
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              variants={staggerContainer}
            >
              <motion.div variants={fadeItem} className="flex flex-col items-center sm:items-start group">
                <div className="w-12 h-12 bg-base rounded-full flex items-center justify-center mb-5 shadow-sm border border-border-light group-hover:border-primary/50 transition-colors">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-base font-bold mb-2 text-navy tracking-tight">Role-Based Access</h4>
                <p className="text-sm text-content-muted leading-relaxed">
                  Separate secure experiences specifically tailored for students, recruiters, and placement administrators.
                </p>
              </motion.div>

              <motion.div variants={fadeItem} className="flex flex-col items-center sm:items-start group">
                <div className="w-12 h-12 bg-base rounded-full flex items-center justify-center mb-5 shadow-sm border border-border-light group-hover:border-primary/50 transition-colors">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-base font-bold mb-2 text-navy tracking-tight">Verified Opportunities</h4>
                <p className="text-sm text-content-muted leading-relaxed">
                  Companies and their job postings undergo administrative review before becoming visible to the student body.
                </p>
              </motion.div>

              <motion.div variants={fadeItem} className="flex flex-col items-center sm:items-start group">
                <div className="w-12 h-12 bg-base rounded-full flex items-center justify-center mb-5 shadow-sm border border-border-light group-hover:border-primary/50 transition-colors">
                  <CheckSquare className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-base font-bold mb-2 text-navy tracking-tight">Eligibility Constraints</h4>
                <p className="text-sm text-content-muted leading-relaxed">
                  Students are strictly evaluated against job eligibility criteria (CGPA, Branch, Year) prior to applying.
                </p>
              </motion.div>

              <motion.div variants={fadeItem} className="flex flex-col items-center sm:items-start group">
                <div className="w-12 h-12 bg-base rounded-full flex items-center justify-center mb-5 shadow-sm border border-border-light group-hover:border-primary/50 transition-colors">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-base font-bold mb-2 text-navy tracking-tight">Application Tracking</h4>
                <p className="text-sm text-content-muted leading-relaxed">
                  Maintain full visibility over recruitment progress through an organized, multi-stage workflow.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 5. STUDENT FOCUSED SECTION */}
        <section id="students-section" className="scroll-mt-20 py-24 px-6 md:px-12 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div 
                className="flex-1 space-y-8"
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                variants={fadeUp}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> For Students
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy mb-6">
                    Navigate your placement journey with confidence.
                  </h2>
                  <p className="text-content-muted text-lg leading-relaxed max-w-xl">
                    CareerBridge provides students with a single, streamlined destination to discover institutional placement opportunities, track application statuses, and showcase their academic profiles.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <Search className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Discover Opportunities</h4>
                      <p className="text-sm text-content-muted">Browse jobs approved specifically for your institution.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Instant Eligibility</h4>
                      <p className="text-sm text-content-muted">Know immediately if you meet the requirements to apply.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <TrendingUp className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Track Progress</h4>
                      <p className="text-sm text-content-muted">Follow your application from Under Review to Selected.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <Bookmark className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Save Jobs</h4>
                      <p className="text-sm text-content-muted">Bookmark interesting roles to review and apply later.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="primary" className="shadow-sm" onClick={() => navigate('/login?role=student')}>
                    Enter Student Portal <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>

              {/* Decorative Visual Mock (Opposite entrance + slight parallax) */}
              <motion.div 
                className="flex-1 w-full h-[400px] lg:h-[500px] relative overflow-hidden hidden lg:block"
                style={{ y: parallaxYDown }}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                variants={fadeDown}
              >
                <div className="w-full h-full rounded-[2rem] bg-surface border border-border-light shadow-sm flex items-center justify-center overflow-hidden relative">
                  <img src={studentsRoleImage} alt="Students on campus" className="w-full h-full object-cover object-center" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 6. RECRUITER FOCUSED SECTION */}
        <section id="recruiters-section" className="scroll-mt-20 py-24 px-6 md:px-12 bg-surface border-y border-border-light relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
              <motion.div 
                className="flex-1 space-y-8"
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                variants={fadeUp}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> For Recruiters
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy mb-6">
                    Source the best talent efficiently.
                  </h2>
                  <p className="text-content-muted text-lg leading-relaxed max-w-xl">
                    Post opportunities, set precise academic filters, and manage your entire institutional hiring pipeline from a unified, professional interface.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-base border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Post Opportunities</h4>
                      <p className="text-sm text-content-muted">Easily draft and publish detailed job postings.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-base border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <UserCheck className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Enforce Criteria</h4>
                      <p className="text-sm text-content-muted">Set CGPA, branch, and graduation year filters.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-base border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <ClipboardList className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Pipeline Management</h4>
                      <p className="text-sm text-content-muted">Move candidates through defined recruitment stages.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-base border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <CheckSquare className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Review Applicants</h4>
                      <p className="text-sm text-content-muted">Access resumes and academic details seamlessly.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="primary" className="shadow-sm" onClick={() => navigate('/login?role=recruiter')}>
                    Enter Recruiter Portal <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>

              {/* Decorative Visual Mock */}
              <motion.div 
                className="flex-1 w-full h-[400px] lg:h-[500px] relative overflow-hidden hidden lg:block"
                style={{ y: parallaxYUp }}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                variants={fadeDown}
              >
                <div className="w-full h-full rounded-[2rem] bg-surface border border-border-light shadow-sm flex items-center justify-center overflow-hidden relative">
                  <img src={recruitersRoleImage} alt="Recruitment meeting" className="w-full h-full object-cover object-center" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 7. PLACEMENT CELL FOCUSED SECTION */}
        <section id="placement-section" className="scroll-mt-20 py-24 px-6 md:px-12 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div 
                className="flex-1 space-y-8"
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                variants={fadeUp}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" /> For Placement Cells
                  </div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy mb-6">
                    Maintain institutional oversight.
                  </h2>
                  <p className="text-content-muted text-lg leading-relaxed max-w-xl">
                    Ensure quality and transparency by reviewing and approving every company and job posting before they reach your students.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <Eye className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Review Registrations</h4>
                      <p className="text-sm text-content-muted">Assess and verify incoming company profiles.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Approve Opportunities</h4>
                      <p className="text-sm text-content-muted">Vouch for legitimate job postings.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Maintain Control</h4>
                      <p className="text-sm text-content-muted">Suspend or revoke access for non-compliant entities.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-surface border border-transparent hover:border-border-light transition-colors">
                    <div className="w-10 h-10 rounded-full bg-base border border-border-light flex items-center justify-center shrink-0">
                      <Archive className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy mb-1 text-sm">Audit History</h4>
                      <p className="text-sm text-content-muted">Keep a transparent record of all governance actions.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="primary" className="shadow-sm" onClick={() => navigate('/login?role=admin')}>
                    Enter Admin Portal <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>

              {/* Decorative Visual Mock */}
              <motion.div 
                className="flex-1 w-full h-[400px] lg:h-[500px] relative overflow-hidden hidden lg:block"
                style={{ y: parallaxYDown }}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                variants={fadeDown}
              >
                <div className="w-full h-full rounded-[2rem] bg-surface border border-border-light shadow-sm flex items-center justify-center overflow-hidden relative">
                  <img src={placementRoleImage} alt="Campus placement drive" className="w-full h-full object-cover object-center" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 8. FINAL CTA */}
        <section className="py-24 px-6 md:px-12 bg-surface border-t border-border-light relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-base rounded-full opacity-60 blur-3xl pointer-events-none transform translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-base rounded-full opacity-60 blur-2xl pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

          <motion.div 
            className="max-w-2xl mx-auto text-center relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            variants={fadeUp}
          >
            <div className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-6">
              Get Started Today
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight mb-6 text-navy">
              Ready to begin?
            </h2>
            <p className="text-content-muted text-lg mb-10">
              Choose your role and enter the CareerBridge platform.
            </p>
            {user ? (
              <Button variant="primary" size="lg" className="px-10 py-6 text-base shadow-sm hover:-translate-y-0.5 transition-transform" onClick={() => navigate(`/${user.role.toLowerCase()}/dashboard`)}>
                Enter Portal <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button variant="primary" size="lg" className="px-10 py-6 text-base shadow-sm hover:-translate-y-0.5 transition-transform" onClick={() => navigate('/login')}>
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </motion.div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="py-12 px-6 md:px-12 border-t border-border-light bg-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <a href="#hero" onClick={(e) => handleScroll(e, 'hero')} className="text-xl font-serif font-bold tracking-tight text-navy">
                Career<span className="text-primary">Bridge</span>
              </a>
            </div>
            <p className="text-sm text-content-muted leading-relaxed max-w-sm">
              An institutional recruitment platform connecting students, recruiters, and placement cells.
            </p>
          </div>
          
          <div>
            <h5 className="text-sm font-bold text-navy mb-5">Platform</h5>
            <div className="flex flex-col gap-3 text-sm text-content-muted">
              <a href="#students-section" onClick={(e) => handleScroll(e, 'students-section')} className="hover:text-primary transition-colors cursor-pointer">For Students</a>
              <a href="#recruiters-section" onClick={(e) => handleScroll(e, 'recruiters-section')} className="hover:text-primary transition-colors cursor-pointer">For Recruiters</a>
              <a href="#placement-section" onClick={(e) => handleScroll(e, 'placement-section')} className="hover:text-primary transition-colors cursor-pointer">For Placement Cells</a>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-bold text-navy mb-5">Support / Legal</h5>
            <div className="flex flex-col gap-3 text-sm text-content-muted">
              <a href="#" className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-content-muted">
            &copy; {new Date().getFullYear()} CareerBridge Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
