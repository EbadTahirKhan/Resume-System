import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { achievementAPI, skillAPI, resumeAPI } from '../services/api';
import { Award, Brain, FileText, Plus, TrendingUp } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState({
    achievements: 0,
    skills: 0,
    resumes: 0,
  });
  const [recentAchievements, setRecentAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [achievementsRes, skillsRes, resumesRes] = await Promise.all([
        achievementAPI.getAll(),
        skillAPI.getAll(),
        resumeAPI.getAll(),
      ]);

      setStats({
        achievements: achievementsRes.data.achievements.length,
        skills: skillsRes.data.skills.length,
        resumes: resumesRes.data.resumes.length,
      });

      setRecentAchievements(achievementsRes.data.achievements.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Achievements',
      value: stats.achievements,
      icon: Award,
      color: 'bg-blue-500',
      link: '/achievements',
    },
    {
      title: 'Skills',
      value: stats.skills,
      icon: Brain,
      color: 'bg-green-500',
      link: '/skills',
    },
    {
      title: 'Resumes',
      value: stats.resumes,
      icon: FileText,
      color: 'bg-purple-500',
      link: '/resume/generate',
    },
  ];

  const getAchievementIcon = (type) => {
    const icons = {
      internship: '💼',
      project: '🚀',
      course: '📚',
      hackathon: '🏆',
    };
    return icons[type] || '📝';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.full_name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your resume building journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              to={stat.link}
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/resume/generate"
          className="card hover:shadow-md transition-shadow cursor-pointer border-2 border-primary-200 bg-primary-50"
        >
          <div className="flex items-center">
            <div className="bg-primary-600 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate New Resume</h3>
              <p className="text-sm text-gray-600">Create a professional resume in minutes</p>
            </div>
          </div>
        </Link>

        <Link
          to="/achievements"
          className="card hover:shadow-md transition-shadow cursor-pointer border-2 border-green-200 bg-green-50"
        >
          <div className="flex items-center">
            <div className="bg-green-600 p-3 rounded-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Achievement</h3>
              <p className="text-sm text-gray-600">Track your internships, projects & more</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Achievements */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Achievements</h2>
          <Link to="/achievements" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>

        {recentAchievements.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No achievements yet. Start adding your accomplishments!</p>
            <Link to="/achievements" className="btn-primary mt-4 inline-block">
              Add Your First Achievement
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-2xl mr-4">{getAchievementIcon(achievement.type)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.organization}</p>
                  <div className="flex items-center mt-2 space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
                      {achievement.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(achievement.start_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;