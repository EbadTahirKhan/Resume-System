import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { achievementAPI, skillAPI, resumeAPI } from '../services/api';
import { Sparkles, FileText, CheckCircle } from 'lucide-react';

function ResumeGenerator() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedAchievements, setSelectedAchievements] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [resumeTitle, setResumeTitle] = useState('');
  const [templateType, setTemplateType] = useState('modern');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [achievementsRes, skillsRes] = await Promise.all([
        achievementAPI.getAll(),
        skillAPI.getAll(),
      ]);

      setAchievements(achievementsRes.data.achievements);
      setSkills(skillsRes.data.skills);
      
      // Pre-select all by default
      setSelectedAchievements(achievementsRes.data.achievements.map(a => a.id));
      setSelectedSkills(skillsRes.data.skills.map(s => s.id));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const toggleAchievement = (id) => {
    setSelectedAchievements(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleSkill = (id) => {
    setSelectedSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (!resumeTitle.trim()) {
      alert('Please enter a resume title');
      return;
    }

    setLoading(true);
    try {
      const response = await resumeAPI.generate({
        title: resumeTitle,
        template_type: templateType,
        achievement_ids: selectedAchievements,
        skill_ids: selectedSkills,
      });

      alert('Resume generated successfully! 🎉');
      navigate(`/resume/${response.data.resume.id}`);
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = (type) => {
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
      <div className="text-center mb-8">
        <Sparkles className="h-12 w-12 text-primary-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Generate Your Professional Resume
        </h1>
        <p className="text-gray-600">
          Select your achievements and skills, and we'll create a polished resume for you
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {num}
              </div>
              {num < 3 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step > num ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Achievements */}
      {step === 1 && (
        <div className="card max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Step 1: Select Achievements
          </h2>
          <p className="text-gray-600 mb-6">
            Choose the achievements you want to include in your resume
          </p>

          {achievements.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No achievements found.</p>
              <button
                onClick={() => navigate('/achievements')}
                className="btn-primary"
              >
                Add Achievements First
              </button>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  onClick={() => toggleAchievement(achievement.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedAchievements.includes(achievement.id)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {selectedAchievements.includes(achievement.id) ? (
                        <CheckCircle className="h-6 w-6 text-primary-600" />
                      ) : (
                        <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{getAchievementIcon(achievement.type)}</span>
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{achievement.organization}</p>
                      <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setSelectedAchievements(achievements.map(a => a.id))}
              className="btn-secondary"
            >
              Select All
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={selectedAchievements.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              Next: Select Skills
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select Skills */}
      {step === 2 && (
        <div className="card max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Step 2: Select Skills
          </h2>
          <p className="text-gray-600 mb-6">
            Choose the skills you want to highlight in your resume
          </p>

          {skills.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No skills found.</p>
              <button
                onClick={() => navigate('/skills')}
                className="btn-primary"
              >
                Add Skills First
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSkills.includes(skill.id)
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    {selectedSkills.includes(skill.id) ? (
                      <CheckCircle className="h-5 w-5 text-primary-600 mr-2" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 mr-2" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{skill.skill_name}</p>
                      <p className="text-xs text-gray-500">{skill.proficiency_level}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="btn-secondary">
              Back
            </button>
            <div className="space-x-3">
              <button
                onClick={() => setSelectedSkills(skills.map(s => s.id))}
                className="btn-secondary"
              >
                Select All
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedSkills.length === 0}
                className="btn-primary disabled:opacity-50"
              >
                Next: Finalize
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Finalize */}
      {step === 3 && (
        <div className="card max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Step 3: Finalize Your Resume
          </h2>
          <p className="text-gray-600 mb-6">
            Give your resume a title and choose a template
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume Title *
              </label>
              <input
                type="text"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                className="input-field"
                placeholder="e.g., Software Engineer Resume 2025"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Template
              </label>
              <div className="grid grid-cols-3 gap-4">
                {['modern', 'classic', 'minimal'].map((template) => (
                  <div
                    key={template}
                    onClick={() => setTemplateType(template)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      templateType === template
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <p className="font-medium text-gray-900 capitalize">{template}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ {selectedAchievements.length} achievement(s) selected</li>
                <li>✓ {selectedSkills.length} skill(s) selected</li>
                <li>✓ AI-powered professional summary will be generated</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(2)} className="btn-secondary">
              Back
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || !resumeTitle.trim()}
              className="btn-primary disabled:opacity-50 flex items-center"
            >
              {loading ? (
                'Generating...'
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Resume
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeGenerator;