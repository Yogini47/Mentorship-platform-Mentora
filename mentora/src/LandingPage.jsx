import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaBookReader,
  FaChalkboardTeacher,
  FaUserGraduate,
} from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { MdOutlineVerifiedUser, MdForum, MdLockPerson } from "react-icons/md";
import { GrArticle } from "react-icons/gr";

function LandingPage() {
  const navigate = useNavigate();

  const quotes = [
    {
      quote:
        "Education is the most powerful weapon which you can use to change the world.",
      image:
        "https://www.willy-brandt-biography.com/wp-content/uploads/2015/10/3690_Mandela_1024x768-456x500.jpg",
    },
    {
      quote:
        "Education is not the learning of facts, but the training of the mind to think.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg",
    },
    {
      quote: "One child, one teacher, one book, one pen can change the world.",
      image:
        "https://static.euronews.com/articles/stories/07/54/25/12/1440x810_cmsv2_3b509b56-12f7-586e-bff6-96c0c71833ea-7542512.jpg",
    },
    {
      quote: "Education is the manifestation of the perfection already in man.",
      image:
        "https://5.imimg.com/data5/ANDROID/Default/2023/3/MV/BO/HY/186207530/product-jpeg-500x500.jpg",
    },
    {
      quote:
        "Learning gives creativity, creativity leads to thinking, thinking provides knowledge, and knowledge makes you great.",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/1200px-A._P._J._Abdul_Kalam.jpg",
    },
  ];
  const [selectedAuthor, setSelectedAuthor] = useState(quotes[0]);

  return (
    <div className="w-full h-screen">
      <nav className="w-full fixed top-0 left-0 z-50 shadow-lg border-b border-gray-300 px-5 py-3 flex justify-between items-center bg-gray-100">
        <h3 className="text-2xl text-[#1E3A8A] font-bold">Mentora</h3>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => navigate("/LoginPage")}
            className="text-[#1E3A8A] border-2 border-[#1E3A8A] font-semibold text-lg rounded-lg px-3 py-1 transition duration-300 hover:bg-[#1E3A8A] hover:text-white"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/SignupPage")}
            className="text-white bg-[#1E3A8A] border-2 border-[#1E3A8A] font-semibold text-lg rounded-lg px-3 py-1 transition duration-300 hover:bg-black hover:border-black"
          >
            Signup
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div
        className="w-full h-screen relative flex items-center justify-between px-10 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            // "url('https://media.istockphoto.com/id/1796395298/photo/close-up-on-a-computer-screen-with-real-time-stock-market-analytics-graphs-and-reports-stock.webp?a=1&b=1&s=612x612&w=0&k=20&c=NGBrulAEOH4clpLOjq-4SW-JgkVLlAi3WzuCs1laZ70=')",
            "url('https://cdn.pixabay.com/photo/2024/06/14/12/15/developer-8829735_1280.jpg')",
        }}
      >
        {/* Left Side - Quote Placeholder */}
        <div className="flex-1 flex flex-col justify-center items-center z-10 text-white px-4">
          <h1 className="text-4xl lg:text-6xl font-bold leading-snug text-center space-y-4">
            <div className="flex justify-center">
              <span className="typewriter bg-[rgba(0,0,0,0.5)] px-4 py-1 rounded animate-typewriter-1">
                Learn, grow, and succeed
              </span>
            </div>

            <div className="flex justify-center">
              <span className="typewriter bg-[rgba(0,0,0,0.5)] px-4 py-1 rounded animate-typewriter-2">
                because the right mentor makes all the difference.
              </span>
            </div>
          </h1>
        </div>
      </div>

      {/* Features Section */}
      <div className="h-140 w-full bg-gray-100 flex flex-col items-center">
        <h1 className="text-5xl font-bold text-center w-full my-10">
          Get help from our college faculties and alumni
        </h1>

        {/* discuss section */}
        <div className="w-full mt-10 flex items-center justify-between">
          <div className="flex flex-col pl-40 justify-center">
            <h3 className="text-4xl font-semibold mb-5">
              Find Your Perfect Mentor
            </h3>
            <ul className="flex flex-col gap-3">
              <h5 className="text-xl flex items-center gap-2">
                <FaUserTie /> Diverse Industry Experts
              </h5>
              <h5 className="text-xl flex items-center gap-2">
                <TbReportSearch /> Smart Filtering & Recommendations
              </h5>
              <h5 className="text-xl flex items-center gap-2">
                <MdOutlineVerifiedUser /> Verified & Experienced Professionals
              </h5>
            </ul>
          </div>
          <img
            className="w-180 shadow-xl rounded-l-2xl"
            src="/discuss.jpg"
            alt="Mentorship"
          />
        </div>
      </div>

      {/* Blogs Section */}
      <div className="h-140 pt-20 w-full bg-gray-100 flex justify-center">
        <div className="w-full flex items-center justify-between">
          <img
            className="w-180 shadow-xl rounded-r-2xl"
            src="/blogwrite2.jpeg"
            alt="Blog Write"
          />

          <div className="flex flex-col pr-40 justify-center">
            <h3 className="text-4xl font-semibold mb-5">Blog And Insights</h3>
            <ul className="flex flex-col gap-3">
              <h5 className="text-xl flex items-center gap-2">
                <GrArticle /> Mentor-Written Articles
              </h5>
              <h5 className="text-xl flex items-center gap-2">
                <FaBookReader /> Read blogs on career growth & industry trends
              </h5>
              <h5 className="text-xl flex items-center gap-2">
                <FaUserGraduate /> Diverse Topics & Specializations
              </h5>
            </ul>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="h-140 w-full bg-gray-100 flex justify-center items-center">
        <div className="w-full mt-10 flex items-center justify-between">
          <div className="flex flex-col pl-40 justify-center">
            <h3 className="text-4xl font-semibold mb-5">
              One-on-One Chat Support
            </h3>
            <ul className="flex flex-col gap-3">
              <h5 className="text-xl flex items-center gap-2">
                <FaChalkboardTeacher /> Personalized Guidance
              </h5>
              <h5 className="text-xl flex items-center gap-2">
                <MdForum /> Convenient & Flexible Communication
              </h5>
              <h5 className="text-xl flex items-center gap-2">
                <MdLockPerson /> Confidential & Comfortable Space
              </h5>
            </ul>
          </div>
          <img
            className="w-180 shadow-xl rounded-l-2xl"
            src="/chat2.jpg"
            alt="Mentorship"
          />
        </div>
      </div>

      {/* quotes section */}

      <div className="max-w-3xl mx-auto my-16 text-center bg-white rounded-xl shadow-md p-6">
        <blockquote className="text-4xl italic text-gray-800 min-h-[80px] transition-all duration-300">
          “{selectedAuthor.quote}”
        </blockquote>

        <div className="mt-20 flex justify-center gap-6 flex-wrap">
          {quotes.map((q, index) => (
            <div
              key={index}
              onClick={() => setSelectedAuthor(q)}
              className={`cursor-pointer rounded-full p-1 transition-all duration-300
          ${
            selectedAuthor.image === q.image
              ? "ring-4 ring-blue-800"
              : "ring-2 ring-gray-300"
          }
        `}
            >
              <img
                src={q.image}
                alt={`Author ${index}`}
                className="w-16 h-16 rounded-full object-cover hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#1E3A8A] text-white py-10 mt-0">
        <div className="w-4/5 mx-auto flex flex-col md:flex-row justify-between items-start">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold">Mentora</h3>
            <p className="mt-3 text-gray-200">
              Empowering students and professionals by connecting them with
              experienced mentors to grow and succeed.
            </p>
          </div>
          <div className="mb-6 md:mb-0">
            <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-300 hover:text-white transition"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/SignupPage"
                  className="text-gray-300 hover:text-white transition"
                >
                  Find a Mentor
                </a>
              </li>
              <li>
                <a
                  href="/SignupPage"
                  className="text-gray-300 hover:text-white transition"
                >
                  Blogs & Insights
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-300 hover:text-white transition"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-3">Contact Us</h4>
            <p className="text-gray-300">Email: support@mentora.com</p>
            <p className="text-gray-300">Phone: +1 (123) 456-7890</p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-facebook text-2xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-twitter text-2xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-linkedin text-2xl"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="w-full text-center mt-8 border-t border-gray-400 pt-5">
          <p className="text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} Mentora. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
