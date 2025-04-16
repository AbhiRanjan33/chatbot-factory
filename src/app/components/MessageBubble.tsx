export default function MessageBubble({ message }) {
    return (
      <div className="mb-4">
        <div className="bg-gray-200 p-3 rounded">
          <p><strong>Prompt:</strong> {message.prompt}</p>
          {message.files.length > 0 && (
            <p><strong>Files:</strong> {message.files.join(', ')}</p>
          )}
        </div>
        <div className="bg-blue-100 p-3 mt-2 rounded">
          <p><strong>API Link:</strong> <a href={message.apiLink} className="text-blue-500 underline">{message.apiLink}</a></p>
        </div>
      </div>
    );
  }