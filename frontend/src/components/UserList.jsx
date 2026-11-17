export default function UserList({ users, currentUserId, onEdit, onDelete }) {
  if (!users.length) return <p className="empty">No users yet.</p>;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Name</th><th>Membership ID</th><th>Role</th><th></th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td data-label="Name">{u.name}</td>
              <td data-label="Membership ID">{u.membership_id}</td>
              <td data-label="Role"><span className={`tag tag-${u.role}`}>{u.role}</span></td>
              <td className="row-actions">
                <button className="btn btn-small" onClick={() => onEdit(u)}>Update</button>
                <button className="btn btn-small btn-danger" disabled={u.id === currentUserId}
                        title={u.id === currentUserId ? 'You cannot delete your own account' : ''}
                        onClick={() => onDelete(u)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
