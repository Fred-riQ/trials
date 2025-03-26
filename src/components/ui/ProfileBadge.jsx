// src/components/ui/ProfileBadge.jsx
import { FiUser } from 'react-icons/fi';

const ProfileBadge = ({ username, role, avatar }) => {
  return (
    <div className="flex items-center space-x-3">
      {avatar ? (
        <img 
          src={avatar} 
          className="h-8 w-8 rounded-full object-cover" 
          alt="Profile" 
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          <FiUser className="text-gray-500" size={14} />
        </div>
      )}
      <div className="hidden md:block">
        <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
          {username || 'User'}
        </p>
        <p className="text-xs text-gray-500 capitalize">
          {role?.toLowerCase() || 'role'}
        </p>
      </div>
    </div>
  );
};

export default ProfileBadge;