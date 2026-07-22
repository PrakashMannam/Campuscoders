export const topicsData = {
  'oop': {
    id: 'oop',
    pathId: 'java',
    pathTitle: 'Java Full Stack',
    moduleTitle: 'Core Java',
    title: 'Object Oriented Programming (OOP)',
    description: 'Understand the core principles of OOP in Java including classes, objects, inheritance, polymorphism, abstraction and encapsulation.',
    resourcesCount: 12,
    estimatedDuration: '4h 35m Estimated',
    difficulty: 'Beginner Friendly',
    categoryTag: 'Core Java',
    completed: false,
    bookmarked: true,
    progressPercent: 28,
    nextTopic: {
      id: 'collections',
      title: 'Collections Framework',
      estimatedDuration: '3h 10m'
    },
    roadmapTopics: [
      { id: 'oop', title: 'Object Oriented Programming (OOP)', status: 'In Progress', active: true },
      { id: 'collections', title: 'Collections Framework', status: 'Locked', active: false },
      { id: 'streams', title: 'Streams API', status: 'Locked', active: false },
      { id: 'exceptions', title: 'Exception Handling', status: 'Locked', active: false },
      { id: 'jdbc', title: 'JDBC Basics', status: 'Locked', active: false }
    ]
  },
  'collections': {
    id: 'collections',
    pathId: 'java',
    pathTitle: 'Java Full Stack',
    moduleTitle: 'Core Java',
    title: 'Java Collections Framework',
    description: 'Master List, Set, Map interfaces, ArrayList, LinkedList, HashMap, HashSet, and Iterator implementations.',
    resourcesCount: 8,
    estimatedDuration: '3h 10m Estimated',
    difficulty: 'Beginner Friendly',
    categoryTag: 'Core Java',
    completed: false,
    bookmarked: false,
    progressPercent: 35,
    nextTopic: {
      id: 'streams',
      title: 'Streams API',
      estimatedDuration: '2h 45m'
    },
    roadmapTopics: [
      { id: 'oop', title: 'Object Oriented Programming (OOP)', status: 'Completed', active: false },
      { id: 'collections', title: 'Collections Framework', status: 'In Progress', active: true },
      { id: 'streams', title: 'Streams API', status: 'Locked', active: false },
    ]
  }
};
