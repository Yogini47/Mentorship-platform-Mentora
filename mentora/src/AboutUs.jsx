import React from 'react';

function AboutUs() {
    return (
        <div className="relative bg-[#e3f2fd] min-h-screen flex flex-col items-center justify-center px-6 md:px-16 lg:px-24">
            <nav className="absolute w-full bg-[#1E3A8A] top-0 left-0 py-3 px-10 text-2xl font-bold text-white">Mentora</nav>
            <div className="flex flex-col my-30 md:flex-row items-center w-full max-w-6xl">
                <div className="text-center md:text-left md:w-1/2">
                    <h1 className="text-5xl font-bold text-gray-800 mb-6">ABOUT US</h1>
                    <p className="text-lg text-gray-600 mb-6">
                        At <span className="font-semibold">Mentora</span>, we believe that the right guidance can
                        transform careers and change lives. Our mentorship platform connects aspiring professionals with
                        experienced mentors who provide valuable insights, support, and encouragement.
                    </p>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium shadow-lg hover:bg-blue-700">
                        Learn More
                    </button>
                </div>
                
                {/* Illustration Section with Blob Background */}
                <div className="md:w-1/2 flex justify-center mt-8 md:mt-0 relative">
                    {/* SVG Blob Background (Increased Size) */}
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" 
                        className="absolute z-1 w-[700px] h-[700px] right-[-120px] top-[-120px]">
                        <path fill="#1E3A8A" d="M32.9,-40.1C48.6,-33.9,71.3,-32.2,78.3,-22.6C85.4,-13,76.7,4.6,66.6,17.2C56.4,29.9,44.7,37.7,33.4,45.6C22,53.5,11,61.4,-1.6,63.7C-14.3,66,-28.6,62.5,-42.4,55.4C-56.1,48.3,-69.4,37.6,-76.9,23C-84.4,8.4,-86.1,-10.1,-78,-22.3C-69.9,-34.6,-51.9,-40.6,-37.2,-47.1C-22.6,-53.6,-11.3,-60.7,-1.3,-58.9C8.6,-57.1,17.2,-46.3,32.9,-40.1Z" transform="translate(100 100)" />
                    </svg>

                    {/* Mentor Image */}
                    <img src="/mentorimage.png" alt="About Us Illustration" className="w-full max-w-md relative z-10" />
                </div>
            </div>

            {/* second section */}

            <div className="flex flex-col md:flex-row items-center w-full max-w-6xl">
                
                {/* Illustration Section with Blob Background */}
                <div className="md:w-1/2 flex justify-center mt-8 md:mt-0 relative">
                    {/* SVG Blob Background (Increased Size) */}
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"
                        className="absolute z-1 w-[700px] h-[700px] right-[80px] top-[-120px]">
                       <path fill="#83C4F7" d="M52.1,-66.7C65.6,-61.8,73.4,-44.1,76.5,-26.7C79.5,-9.3,77.8,7.7,70.7,21C63.6,34.2,51.2,43.7,38.5,52.1C25.8,60.4,12.9,67.6,-0.7,68.5C-14.2,69.5,-28.4,64.1,-39.7,55.3C-51,46.5,-59.4,34.2,-61.4,21.5C-63.4,8.8,-59,-4.5,-55.7,-19.2C-52.5,-33.9,-50.3,-50.1,-41.2,-56.4C-32.1,-62.6,-16.1,-59,1.6,-61.2C19.3,-63.4,38.5,-71.5,52.1,-66.7Z" transform="translate(100 100)" />
                    </svg>

                    {/* Mentor Image */}
                    <img src="/mentorimage.png" alt="About Us Illustration" className="w-full right-30 max-w-md relative z-10" />
                </div>

                <div className="text-center md:text-left md:w-1/2">
                    <h1 className="text-5xl font-bold text-gray-800 mb-6">OUR MISSION</h1>
                    <p className="text-lg text-gray-600 mb-6">
                    Our mission is to bridge the gap between knowledge and experience by
                     creating a community where mentorship thrives. We empower mentees with
                      personalized guidance from industry experts, helping them navigate their
                       career paths with confidence.
                    </p>
                
                </div>
            </div>

            {/* third section */}

            <div className="flex flex-col my-30 md:flex-row items-center w-full max-w-6xl">
                <div className="text-center md:text-left md:w-1/2">
                    <h1 className="text-5xl font-bold text-gray-800 mb-6">WHAT WE OFFER</h1>
                    <p className="text-lg text-gray-600 mb-6">
                    ✅ Expert Mentorship – Learn from professionals with years of industry experience.  <br />
✅ One-on-One Guidance – Personalized mentorship sessions tailored to your goals.  <br />
✅ Career Growth – Get advice on career planning, skill development, and networking.  <br />
✅ Community Support – Engage with like-minded mentees and mentors who are passionate about growth. 
                    </p>
                </div>
                
                {/* Illustration Section with Blob Background */}
                <div className="md:w-1/2 flex justify-center mt-8 md:mt-0 relative">
                    {/* SVG Blob Background (Increased Size) */}
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" 
                        className="absolute z-1 w-[700px] h-[700px] right-[-120px] top-[-120px]">
                        <path fill="#1E3A8A" d="M32.9,-40.1C48.6,-33.9,71.3,-32.2,78.3,-22.6C85.4,-13,76.7,4.6,66.6,17.2C56.4,29.9,44.7,37.7,33.4,45.6C22,53.5,11,61.4,-1.6,63.7C-14.3,66,-28.6,62.5,-42.4,55.4C-56.1,48.3,-69.4,37.6,-76.9,23C-84.4,8.4,-86.1,-10.1,-78,-22.3C-69.9,-34.6,-51.9,-40.6,-37.2,-47.1C-22.6,-53.6,-11.3,-60.7,-1.3,-58.9C8.6,-57.1,17.2,-46.3,32.9,-40.1Z" transform="translate(100 100)" />
                    </svg>

                    {/* Mentor Image */}
                    <img src="/mentorimage.png" alt="About Us Illustration" className="w-full max-w-md relative z-10" />
                </div>
            </div>

        </div>
    );
}

export default AboutUs;
