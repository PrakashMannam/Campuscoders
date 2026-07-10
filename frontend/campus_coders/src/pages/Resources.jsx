import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMonitor, FiCode, FiCpu, FiGlobe } from 'react-icons/fi';
import DashboardLayout from '../components/DashboardLayout';

const courses = [
  {
    id: 'java',
    icon: <FiMonitor size={28} />,
    title: 'Java Development',
    desc: 'Deep dive into enterprise architecture, Spring Boot, and robust backend engineering.',
  },
  {
    id: 'python',
    icon: <FiCode size={28} />,
    title: 'Python Mastery',
    desc: 'From data science to AI. Learn clean code, NumPy, and high-performance automation.',
  },
  {
    id: 'dsa',
    icon: <FiCpu size={28} />,
    title: 'DSA Intensive',
    desc: 'Algorithms and data structures optimized for technical interviews at top engineering firms.',
  },
  {
    id: 'fullstack',
    icon: <FiGlobe size={28} />,
    title: 'Full Stack Web',
    desc: 'Build modern reactive interfaces with React, Tailwind, and high-performance Node.js APIs.',
  },
];

export default function Resources() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="rs-page">
        <h2 className="rs-page-title">Course Selection</h2>

        <h3 className="rs-heading">Master your craft.</h3>
        <p className="rs-subtitle">
          Select a specialized track to begin your journey. Our curriculum is designed by industry
          experts and academic veterans to provide a high-fidelity learning experience.
        </p>

        <div className="rs-courses-grid">
          {courses.map(course => (
            <div key={course.id} className="rs-course-card" id={`course-${course.id}`}>
              <div className="rs-course-icon">{course.icon}</div>
              <h4 className="rs-course-title">{course.title}</h4>
              <p className="rs-course-desc">{course.desc}</p>
              <button
                className="rs-course-btn"
                onClick={() => navigate(`/dashboard/resources/${course.id}`)}
              >
                VIEW RESOURCES
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
