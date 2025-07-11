
import moment from 'moment';

export default function MessageBubble({ message }) {
  const userId =
    localStorage.getItem('userId') ||
    localStorage.getItem('menteeId') ||
    localStorage.getItem('mentorId');

  const senderId = typeof message.sender === 'string'
    ? message.sender
    : message.sender?._id;

  const isOwnMessage = senderId === userId;

  const time = message.createdAt && moment(message.createdAt).isValid()
    ? moment.utc(message.createdAt).local().format('hh:mm A')
    : '';

  const fullTimestamp = message.createdAt && moment(message.createdAt).isValid()
    ? moment.utc(message.createdAt).local().format('DD MMM YYYY, hh:mm A')
    : '';

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`p-2 rounded-lg max-w-xs break-words ${
          isOwnMessage ? 'bg-[#1E3A8A] text-white' : 'bg-gray-300 text-black'
        }`}
      >
        {/* File Attachment */}
        {message.fileUrl && (
          <div className="mb-2">
            {message.fileType?.startsWith('image/') ? (
              <img
                src={message.fileUrl}
                alt={message.fileName || 'Image'}
                className="rounded max-w-full max-h-48 object-contain"
              />
            ) : (
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-sm text-blue-200"
              >
                📎 {message.fileName || 'Download file'}
              </a>
            )}
          </div>
        )}

        {/* Text Message */}
        {message.content && <div>{message.content}</div>}

        {/* Timestamp & Read Receipt */}
        <div className="text-xs mt-1 text-right" title={fullTimestamp}>
          {time}
          {isOwnMessage && message.isRead && (
            <span className="ml-1 text-green-300">✓✓</span>
          )}
        </div>
      </div>
    </div>
  );
}




// import moment from 'moment';

// export default function MessageBubble({ message }) {
//   const userId = localStorage.getItem('userId');
//   const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
//   const isOwnMessage = senderId === userId;

//   const time = message.createdAt
//     ? moment.utc(message.createdAt).local().format('hh:mm A')
//     : '';

//   return (
//     <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}>
//       <div
//         className={`p-2 rounded-lg max-w-xs ${
//           isOwnMessage ? 'bg-[#1E3A8A] text-white' : 'bg-gray-400 text-black'
//         }`}
//       >
//         <div className="flex flex-col">
//           {/* Message text */}
//           <div className="whitespace-pre-wrap break-words">{message.content}</div>

//           {/* Time aligned to right bottom */}
//           <div className="flex justify-end mt-1">
//             <span className="text-[10px] opacity-70" title={moment.utc(message.createdAt).local().format('DD MMM YYYY, hh:mm A')}>
//               {time}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


