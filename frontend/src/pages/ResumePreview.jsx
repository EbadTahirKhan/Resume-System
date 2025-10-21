import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resumeAPI } from '../services/api';
import { Download, Edit, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

function ResumePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      const response = await resumeAPI.getComplete(id);
      setResumeData(response.data);
    } catch (error) {
      console.error('Error fetching resume:', error);
      alert('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading resume...</div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Resume not found</div>
      </div>
    );
  }

  const { resume, user, achievements, skills } = resumeData;

  // Group achievements by type
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const type = achievement.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(achievement);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </button>
          <div className="space-x-3">
            <button onClick={handlePrint} className="btn-secondary">
              <Download className="h-5 w-5 inline mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-12">
            <div className="text-center mb-8 border-b-2 border-primary-600 pb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {user.full_name}
              </h1>
              <div className="flex justify-center items-center space-x-4 text-sm text-gray-600">
                {user.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {user.email}
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {user.phone}
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {user.location}
                  </div>
                )}
              </div>
            </div>

            {resume.summary && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  Professional Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
              </div>
            )}

            {skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-2">
                  Skills
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center">
                      <span className="w-2 h-2 bg-primary-600 rounded-full mr-2"></span>
                      <span className="text-gray-700">
                        {skill.skill_name}
                        <span className="text-gray-500 text-sm ml-1">
                          ({skill.proficiency_level})
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupedAchievements.internship && groupedAchievements.internship.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Experience
                </h2>
                <div className="space-y-5">
                  {groupedAchievements.internship.map((achievement) => (
                    <div key={achievement.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-700 font-medium">{achievement.organization}</p>
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          {achievement.start_date && new Date(achievement.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {achievement.end_date && ` - ${new Date(achievement.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2">{achievement.description}</p>
                      {achievement.skills_used && achievement.skills_used.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Technologies: </span>
                          <span className="text-sm text-gray-700">
                            {achievement.skills_used.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupedAchievements.project && groupedAchievements.project.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Projects
                </h2>
                <div className="space-y-5">
                  {groupedAchievements.project.map((achievement) => (
                    <div key={achievement.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {achievement.title}
                          </h3>
                          {achievement.organization && (
                            <p className="text-gray-700 font-medium">{achievement.organization}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          {achievement.start_date && new Date(achievement.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {achievement.end_date && ` - ${new Date(achievement.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                        </div>
                      </div>
                      <p className="text-gray-600 mt-2">{achievement.description}</p>
                      {achievement.skills_used && achievement.skills_used.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-500">Technologies: </span>
                          <span className="text-sm text-gray-700">
                            {achievement.skills_used.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupedAchievements.course && groupedAchievements.course.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Education & Certifications
                </h2>
                <div className="space-y-4">
                  {groupedAchievements.course.map((achievement) => (
                    <div key={achievement.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-700">{achievement.organization}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {achievement.end_date && new Date(achievement.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {groupedAchievements.hackathon && groupedAchievements.hackathon.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Achievements & Competitions
                </h2>
                <div className="space-y-4">
                  {groupedAchievements.hackathon.map((achievement) => (
                    <div key={achievement.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-700">{achievement.organization}</p>
                          <p className="text-gray-600 mt-1">{achievement.description}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {achievement.start_date && new Date(achievement.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-sm text-gray-500 print:hidden">
          <p>✨ Generated with Resume Builder - Tip: Use Ctrl+P or Cmd+P to save as PDF</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ResumePreview;