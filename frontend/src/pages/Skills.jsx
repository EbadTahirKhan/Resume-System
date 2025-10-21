// src/pages/Skills.jsx - Skills Management Page
import { useState, useEffect } from 'react';
import { skillAPI } from '../services/api';
import { Plus, Edit, Trash2, X, Brain } from 'lucide-react';

function Skills() {
  const [skills, setSkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    skill_name: '',
    proficiency_level: 'Intermediate',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await skillAPI.getAll();
      setSkills(response.data.skills);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await skillAPI.update(editingId, formData);
      } else {
        await skillAPI.create(formData);
      }

      fetchSkills();
      resetForm();
    } catch (error) {
      console.error('Error saving skill:', error);
      alert(error.response?.data?.error || 'Failed to save skill');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (skill) => {
    setEditingId(skill.id);
    setFormData({
      skill_name: skill.skill_name,
      proficiency_level: skill.proficiency_level,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await skillAPI.delete(id);
        fetchSkills();
      } catch (error) {
        console.error('Error deleting skill:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      skill_name: '',
      proficiency_level: 'Intermediate',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const getProficiencyColor = (level) => {
    const colors = {
      Beginner: 'bg-yellow-100 text-yellow-800',
      Intermediate: 'bg-blue-100 text-blue-800',
      Advanced: 'bg-green-100 text-green-800',
      Expert: 'bg-purple-100 text-purple-800',
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const level = skill.proficiency_level || 'Intermediate';
    if (!acc[level]) acc[level] = [];
    acc[level].push(skill);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Skills</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="h-5 w-5 inline mr-2" />
          Add Skill
        </button>
      </div>

      {skills.length === 0 ? (
        <div className="card text-center py-12">
          <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No skills added yet. Start building your skill portfolio!</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {['Expert', 'Advanced', 'Intermediate', 'Beginner'].map((level) => {
            const levelSkills = groupedSkills[level];
            if (!levelSkills || levelSkills.length === 0) return null;

            return (
              <div key={level} className="card">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium mr-3 ${getProficiencyColor(level)}`}>
                    {level}
                  </span>
                  <span className="text-gray-500 text-base font-normal">
                    ({levelSkills.length} skill{levelSkills.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {levelSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="group relative bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 truncate pr-2">
                          {skill.skill_name}
                        </span>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(skill)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(skill.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Skill' : 'Add New Skill'}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Skill Name *
                  </label>
                  <input
                    type="text"
                    value={formData.skill_name}
                    onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., React, Python, Design Thinking"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proficiency Level *
                  </label>
                  <select
                    value={formData.proficiency_level}
                    onChange={(e) => setFormData({ ...formData, proficiency_level: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Be honest about your proficiency level - it helps create an accurate resume
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={resetForm} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : editingId ? 'Update Skill' : 'Add Skill'}
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

export default Skills;