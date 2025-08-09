/**
 * Utility to create test progress data for demonstration
 * This helps users see how the ResumeProgressLegoBlock works
 */

export function createTestProgressData() {
  const testProgress = {
    responseId: 'test-response-' + Date.now(),
    questionnaireId: '91684df8-9700-4605-bc3e-2320120e5e1b',
    answers: {
      'q1': 'Started assessment but incomplete',
      'q2': 'Some answers provided'
    },
    currentSection: 1,
    currentQuestionIndex: 3,
    email: 'test.user@rsa.com',
    name: 'Test User',
    lastSaved: new Date().toLocaleString(),
    timestamp: Date.now(),
    totalSections: 6,
    completionPercentage: 25,
    sectionProgress: {
      1: {
        sectionNumber: 1,
        started: true,
        completed: false,
        currentQuestionIndex: 3,
        totalQuestions: 10,
        completionPercentage: 30,
        lastModified: new Date().toISOString(),
        answers: {
          'q1': 'Started assessment but incomplete',
          'q2': 'Some answers provided'
        }
      }
    }
  };

  const storageKey = `questionnaire-progress-${testProgress.questionnaireId}`;
  localStorage.setItem(storageKey, JSON.stringify(testProgress));
  
  console.log('Test progress data created:', testProgress);
  return testProgress;
}

// Function to clear test data
export function clearTestProgressData() {
  const questionnaireId = '91684df8-9700-4605-bc3e-2320120e5e1b';
  const storageKey = `questionnaire-progress-${questionnaireId}`;
  localStorage.removeItem(storageKey);
  console.log('Test progress data cleared');
}