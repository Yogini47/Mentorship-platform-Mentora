// ChatBox.js
import React, { useState } from 'react';
import { X } from 'lucide-react';

const ChatBox = ({ mentee, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: 'mentor', text: input }]);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-150 bg-white shadow-lg rounded-lg">
      <div className=' bg-[#182e6e] flex py-2 px-1 rounded-t-lg mb-2 justify-between'>
        <div className='flex items-center gap-x-2'>
        <img src={mentee.profile_pic}
         alt={mentee.name}
         className='h-8 w-8 rounded-full object-cover'
          />
      <h2 className="font-semibold text-white text-lg">{mentee.name}</h2>
        </div>
      <button onClick={onClose} className="text-red-400">
        <X className='w-6 h-6 cursor-pointer' />
      </button>
      </div>
      <div className="h-65 overflow-y-auto mb-2">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === 'mentor' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 m-1 rounded-lg ${msg.sender === 'mentor' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="border rounded-l-lg p-2 flex-1"
          placeholder="Type a message..."
        />
        <button onClick={handleSend} className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg p-2 cursor-pointer">Send</button>
      </div>
    </div>
  );
};

export default ChatBox;