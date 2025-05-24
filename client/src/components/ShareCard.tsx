import { formatSuiAddress, getShareUrl } from '@/utils/sui';

interface ShareCardProps {
  share: {
    id: number;
    title: string;
    content: string;
    image?: string;
    createdAt: string;
    user: {
      username: string;
      avatar?: string;
      suiAddress?: string;
    };
    chainTxId?: string;
  };
}

export default function ShareCard({ share }: ShareCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center mb-4">
        {share.user.avatar && (
          <img
            src={share.user.avatar}
            alt={share.user.username}
            className="w-10 h-10 rounded-full mr-3"
          />
        )}
        <div>
          <h3 className="font-semibold">{share.user.username}</h3>
          {share.user.suiAddress && (
            <p className="text-sm text-gray-500">
              SUI: {formatSuiAddress(share.user.suiAddress)}
            </p>
          )}
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-2">{share.title}</h2>
      <p className="text-gray-700 mb-4">{share.content}</p>
      
      {share.image && (
        <img
          src={share.image}
          alt={share.title}
          className="w-full rounded-lg mb-4"
        />
      )}
      
      {share.chainTxId && (
        <a
          href={getShareUrl(share.chainTxId)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 text-sm"
        >
          在SUI浏览器中查看
        </a>
      )}
      
      <div className="text-sm text-gray-500 mt-2">
        {new Date(share.createdAt).toLocaleString()}
      </div>
    </div>
  );
} 