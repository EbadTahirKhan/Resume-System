import { useState, useEffect } from 'react';
import { achievementAPI } from '../services/api';
import { Plus, Edit, Trash2, X } from 'lucide-react';

function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'internship',
    title: '',
    organization: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'completed',
    skills_used: '',
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await achievementAPI.getAll();
      setAchievements(response.data.achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        skills_used: formData.skills_used.split(',').map(s => s.trim()).filter(s => s),
      };

      if (editingId) {
        await achievementAPI.update(editingId, data);
      } else {
        await achievementAPI.create(data);
      }

      fetchAchievements();
      resetForm();
    } catch (error) {
      console.error('Error saving achievement:', error);
      alert('Failed to save achievement');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (achievement) => {
    setEditingId(achievement.id);
    setFormData({
      type: achievement.type,
      title: achievement.title,
      organization: achievement.organization || '',
      description: achievement.description || '',
      start_date: achievement.start_date || '',
      end_date: achievement.end_date || '',
      status: achievement.status,
      skills_used: Array.isArray(achievement.skills_used) ? achievement.skills_used.join(', ') : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      try {
        await achievementAPI.delete(id);
        fetchAchievements();
      } catch (error) {
        console.error('Error deleting achievement:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'internship',
      title: '',
      organization: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'completed',
      skills_used: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const filteredAchievements = filter === 'all' 
    ? achievements 
    : achievements.filter(a => a.type === filter);

  const getTypeIcon = (type) => {
    const icons = {
      internship: '💼',
      project: '🚀',
      course: '📚',
      hackathon: '🏆',
    };
    return icons[type] || '📝';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Achievements</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="h-5 w-5 inline mr-2" />
          Add Achievement
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {['all', 'internship', 'project', 'course', 'hackathon'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievements List */}
      {filteredAchievements.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 mb-4">No achievements found. Start adding your accomplishments!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Add Your First Achievement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAchievements.map((achievement) => (
            <div key={achievement.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getTypeIcon(achievement.type)}</span>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{achievement.title}</h3>
                    <p className="text-sm text-gray-600">{achievement.organization}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(achievement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(achievement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-3">{achievement.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full font-medium">
                  {achievement.type}
                </span>
                <span className="text-gray-500">
                  {achievement.start_date && new Date(achievement.start_date).toLocaleDateString()}
                  {achievement.end_date && ` - ${new Date(achievement.end_date).toLocaleDateString()}`}
                </span>
              </div>

              {achievement.skills_used && achievement.skills_used.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {achievement.skills_used.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Achievement' : 'Add New Achievement'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="internship">Internship</option>
                    <option value="project">Project</option>
                    <option value="course">Course</option>
                    <option value="hackathon">Hackathon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skills Used (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills_used}
                    onChange={(e) => setFormData({ ...formData, skills_used: e.target.value })}
                    className="input-field"
                    placeholder="React, Node.js, PostgreSQL"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : editingId ? 'Update Achievement' : 'Add Achievement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Achievements;