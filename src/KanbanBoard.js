
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const priorityIcons = {
  4: <AlertCircle size={16} color="red" />,
  3: <AlertCircle size={16} color="orange" />,
  2: <AlertCircle size={16} color="yellow" />,
  1: <AlertCircle size={16} color="blue" />,
  0: <AlertCircle size={16} color="gray" />
};

const priorityLabels = {
  4: 'Urgent',
  3: 'High',
  2: 'Medium',
  1: 'Low',
  0: 'No priority'
};

const KanbanBoard = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [grouping, setGrouping] = useState('status');
  const [sorting, setSorting] = useState('priority');
  const [isDisplayMenuOpen, setIsDisplayMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
        const data = await response.json();
        setTickets(data.tickets);
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('kanbanState');
    if (savedState) {
      const { grouping, sorting } = JSON.parse(savedState);
      setGrouping(grouping);
      setSorting(sorting);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kanbanState', JSON.stringify({ grouping, sorting }));
  }, [grouping, sorting]);

  const groupTickets = () => {
    let grouped = {};

    if (grouping === 'status') {
      grouped = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = [...(acc[ticket.status] || []), ticket];
        return acc;
      }, {});
    } else if (grouping === 'user') {
      grouped = tickets.reduce((acc, ticket) => {
        const user = users.find(u => u.id === ticket.userId);
        acc[user.name] = [...(acc[user.name] || []), ticket];
        return acc;
      }, {});
    } else if (grouping === 'priority') {
      grouped = tickets.reduce((acc, ticket) => {
        acc[priorityLabels[ticket.priority]] = [...(acc[priorityLabels[ticket.priority]] || []), ticket];
        return acc;
      }, {});
    }

    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        if (sorting === 'priority') {
          return b.priority - a.priority;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
    });

    return grouped;
  };

  const groupedTickets = groupTickets();

  return (
    <div className="kanban-board">
      <div className="header">
        <button className="display-button" onClick={() => setIsDisplayMenuOpen(!isDisplayMenuOpen)}>
          Display
        </button>
        {isDisplayMenuOpen && (
          <div className="display-menu">
            <div>
              <label>Grouping:</label>
              <select value={grouping} onChange={(e) => setGrouping(e.target.value)}>
                <option value="status">Status</option>
                <option value="user">User</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div>
              <label>Sorting:</label>
              <select value={sorting} onChange={(e) => setSorting(e.target.value)}>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
            </div>
          </div>
        )}
      </div>
      <div className="board">
        {Object.entries(groupedTickets).map(([group, tickets]) => (
          <div key={group} className="column">
            <h2>{group}</h2>
            {tickets.map(ticket => (
              <div key={ticket.id} className="card">
                <div className="card-header">
                  <span>{ticket.id}</span>
                  <span className="user-avatar">
                    {users.find(u => u.id === ticket.userId)?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="card-title">{ticket.title}</div>
                <div className="card-footer">
                  {priorityIcons[ticket.priority]}
                  <span className="tag">{ticket.tag.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <style jsx>{`
        .kanban-board {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          margin-bottom: 20px;
          position: relative;
        }
        .display-button {
          padding: 10px 20px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 5px;
          cursor: pointer;
        }
        .display-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 10px;
          z-index: 1000;
        }
        .display-menu div {
          margin-bottom: 10px;
        }
        .display-menu label {
          margin-right: 10px;
        }
        .board {
          display: flex;
          gap: 20px;
          overflow-x: auto;
        }
        .column {
          min-width: 300px;
          background-color: #f4f5f7;
          border-radius: 5px;
          padding: 10px;
        }
        .column h2 {
          margin-top: 0;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }
        .card {
          background-color: white;
          border-radius: 5px;
          padding: 10px;
          margin-bottom: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .user-avatar {
          width: 25px;
          height: 25px;
          background-color: #ddd;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .card-title {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .card-footer {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .tag {
          background-color: #f0f0f0;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 0.8em;
        }
      `}</style>
    </div>
  );
};

export default KanbanBoard;
