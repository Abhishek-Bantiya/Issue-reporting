import React, { useState, useEffect } from 'react';
import apiAuth from '../apiAuth';
import apiIssues from '../apiIssues';
import './Issues.css';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState('area');
  const [newIssue, setNewIssue] = useState({
    description: '',
    location: '',
    area: '',
    city: '',
    photo: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [comment, setComment] = useState('');
  const issuesPerPage = 5;
  const token = localStorage.getItem('token');


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiAuth.get('/auth/profile');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    const fetchIssues = async () => {
      try {
        const response = await apiIssues.get('/issues');
        setIssues(response.data);
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      }
    };

    fetchUser();
    fetchIssues();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await apiIssues.get(`/issues?${searchType}=${search}`);
      setIssues(response.data);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    console.log('New Issue:', newIssue);
    const formData = new FormData();
    formData.append('description', newIssue.description);
    formData.append('location', newIssue.location);
    formData.append('area', newIssue.area);
    formData.append('city', newIssue.city);
    if (newIssue.photo) {
      formData.append('photo', newIssue.photo); // Ensure newIssue.photo is a File object
    }
    console.log('Form Data:', newIssue);
  
    try {
      const response = await apiIssues.post('/issues', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      setIssues([...issues, response.data]);
      setNewIssue({ description: '', location: '', area: '', city: '', photo: null });
      toast.success('Issue created successfully!');
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  const handleFileChange = (e) => {
    setNewIssue({ ...newIssue, photo: e.target.files[0] });
  };

  const handleHighlight = async (id) => {
    try {
      const response = await apiIssues.post(`/issues/${id}/highlight`);
      setIssues(issues.map(issue => issue._id === id ? { ...issue, upvotes: response.data.upvotes } : issue));
    } catch (error) {
      console.error('Failed to highlight issue:', error);
    }
  };

  const handleRemoveHighlight = async (id) => {
    try {
      const response = await apiIssues.post(`/issues/${id}/remove-highlight`);
      setIssues(issues.map(issue => issue._id === id ? { ...issue, upvotes: response.data.upvotes } : issue));
    } catch (error) {
      console.error('Failed to remove highlight from issue:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiIssues.delete(`/admin/issues/${id}`);
      setIssues(issues.filter(issue => issue._id !== id));
    } catch (error) {
      console.error('Failed to delete issue:', error);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await apiIssues.patch(`/admin/issues/${id}/status`, { status });
      setIssues(issues.map(issue => issue._id === id ? response.data : issue));
    } catch (error) {
      console.error('Failed to update issue status:', error);
    }
  };

  const handleComment = async (id) => {
    try {
      const response = await apiIssues.post(`/issues/${id}/comments`, { text: comment });
      setSelectedIssue({
        ...selectedIssue,
        comments: [...selectedIssue.comments, response.data]
      });
      setComment('');
    } catch (error) {
      console.error('Failed to comment on issue:', error);
    }
  };

  const handleDeleteComment = async (issueId, commentId) => {
    try {
      await apiIssues.delete(`/issues/${issueId}/comments/${commentId}`);
      setSelectedIssue({
        ...selectedIssue,
        comments: selectedIssue.comments.filter(comment => comment._id !== commentId)
      });
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleMyIssues = async () => {
    try {
      const response = await apiIssues.get(`/issues/user/${user.username}`);
      setIssues(response.data);
    } catch (error) {
      console.error('Failed to fetch my issues:', error);
    }
  };

  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = issues.slice(indexOfFirstIssue, indexOfLastIssue);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const uniqueAreas = [...new Set(issues.map(issue => issue.area))];
  const uniqueCities = [...new Set(issues.map(issue => issue.city))];

  return (
    <div className="issues-container">
      <ToastContainer />
      <h1>Issues</h1>
      <div className="filters">
        <label>
          Filter:
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="upvoted">Most Upvoted</option>
          </select>
        </label>
        <label>
          Search by:
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
            <option value="area">Area</option>
            <option value="city">City</option>
          </select>
        </label>
        {searchType === 'area' && (
          <select value={search} onChange={(e) => setSearch(e.target.value)}>
            <option value="">Select Area</option>
            {uniqueAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        )}
        {searchType === 'city' && (
          <select value={search} onChange={(e) => setSearch(e.target.value)}>
            <option value="">Select City</option>
            {uniqueCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        )}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search by ${searchType}`}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="buttons">
        <button onClick={() => document.getElementById('create-issue-modal').style.display = 'block'}>Create Issue</button>
        <button onClick={handleMyIssues}>My Issues</button>
      </div>
      <div id="create-issue-modal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => document.getElementById('create-issue-modal').style.display = 'none'}>&times;</span>
          <form onSubmit={handleCreateIssue} className="create-issue-form">
            <h2>Create New Issue</h2>
            <input
              type="text"
              value={newIssue.description}
              onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
              placeholder="Description"
              required
            />
            <input
              type="text"
              value={newIssue.location}
              onChange={(e) => setNewIssue({ ...newIssue, location: e.target.value })}
              placeholder="Location"
              required
            />
            <input
              type="text"
              value={newIssue.area}
              onChange={(e) => setNewIssue({ ...newIssue, area: e.target.value })}
              placeholder="Area"
              required
            />
            <input
              type="text"
              value={newIssue.city}
              onChange={(e) => setNewIssue({ ...newIssue, city: e.target.value })}
              placeholder="City"
              required
            />
            <input type="file" onChange={handleFileChange} />
            <button type="submit">Create Issue</button>
          </form>
        </div>
      </div>
      <div className="issues-grid">
        {currentIssues.map(issue => (
          <div key={issue._id} className="issue-box" onClick={() => setSelectedIssue(issue)}>
            <p><strong>Description:</strong> {issue.description}</p>
            <p><strong>Location:</strong> {issue.location}</p>
            <p><strong>Area:</strong> {issue.area}</p>
            <p><strong>City:</strong> {issue.city}</p>
            <p><strong>Status:</strong> {issue.status}</p>
            {issue.photo && <img src={`http://localhost:3005/api/images/${issue.photo}`} alt="Issue" />}
          </div>
        ))}
      </div>
      {selectedIssue && (
        <div className="modal" onClick={() => setSelectedIssue(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setSelectedIssue(null)}>&times;</span>
            <h2>{selectedIssue.description}</h2>
            <p><strong>Location:</strong> {selectedIssue.location}</p>
            <p><strong>Area:</strong> {selectedIssue.area}</p>
            <p><strong>City:</strong> {selectedIssue.city}</p>
            <p><strong>Status:</strong> {selectedIssue.status}</p>
            <p><strong>Highlights:</strong> {selectedIssue.upvotes}</p>
            {selectedIssue.photo && <img src={`http://localhost:3005/api/images/${selectedIssue.photo}`} alt="Issue" />}
            <button onClick={() => handleHighlight(selectedIssue._id)}>
              <FaThumbsUp color={selectedIssue.upvotes > 0 ? 'green' : 'gray'} />
            </button>
            <button onClick={() => handleRemoveHighlight(selectedIssue._id)}>
              <FaThumbsDown color={selectedIssue.upvotes > 0 ? 'green' : 'gray'} />
            </button>
            <div className="comments-section">
              <h3>Comments</h3>
              <ul>
                {selectedIssue.comments.map((comment, index) => (
                  <li key={index}>
                    {comment.text}
                    {user && user.username === comment.userId && (
                      <button onClick={() => handleDeleteComment(selectedIssue._id, comment._id)}>Delete</button>
                    )}
                  </li>
                ))}
              </ul>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment"
              />
              <button onClick={() => handleComment(selectedIssue._id)}>Comment</button>
            </div>
            {user && (user.username === selectedIssue.reporterId || user.is_admin) && (
              <>
                <select onChange={(e) => handleStatusUpdate(selectedIssue._id, e.target.value)} value={selectedIssue.status}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
                {user.is_admin && (
                  <button onClick={() => handleDelete(selectedIssue._id)}>Delete</button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <div className="pagination">
        {Array.from({ length: Math.ceil(issues.length / issuesPerPage) }, (_, index) => (
          <button key={index + 1} onClick={() => paginate(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Issues;