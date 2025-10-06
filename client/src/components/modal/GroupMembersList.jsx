import { useState, useEffect } from "react"
import { Users, X, Crown, Check } from "lucide-react"

const GroupMembersList = ({ groupMembers, currentGroup, senderId, onSelect, onClose, selectedMentionUsers = [] }) => {
    const [membersList, setMembersList] = useState([])

    useEffect(() => {
        if (groupMembers) {
            setMembersList(groupMembers)
        }
    }, [groupMembers])
    
    return <>
       <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold">Group Members</h2>
                {selectedMentionUsers.length > 0 && (
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full">
                    {selectedMentionUsers.length} selected
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Members List */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-3">
                {membersList?.map((member) => {
                  const isMemberAdmin = currentGroup?.admins?.some(
                    (adminId) => adminId.toString() === member._id
                  );
                  const isCurrentUser = member._id === senderId;
                  const isSelected = selectedMentionUsers.some(user => user._id === member._id);

                  return (
                    <div
                      key={member._id}
                      className={`flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      onClick={() => {
                        onSelect?.(member)
                      }}
                    >
                      <img
                        src={member.avatarUrl || "/user-avatar.png"}
                        alt={member.username}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{member.username}</p>
                          {isMemberAdmin && (
                            <Crown
                              size={14}
                              className="text-yellow-500"
                              title="Admin"
                            />
                          )}
                        </div>
                        {isCurrentUser && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            You
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex items-center justify-center w-6 h-6 bg-indigo-500 rounded-full">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
    </>
}

export default GroupMembersList;