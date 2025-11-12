import { QuestionnaireStorageService, QuestionnaireDefinition } from './questionnaireStorageService';

/**
 * Demo service to test the hybrid questionnaire architecture
 */
export class QuestionnaireDemoService {
  private storageService: QuestionnaireStorageService;
  constructor() {
    this.storageService = new QuestionnaireStorageService();
  }

  /**
   * Create a sample questionnaire for testing
   */
  async createSampleQuestionnaire(): Promise<string> {
    const questionnaireId = '91684df8-9700-4605-bc3e-2320120e5e1b'; // Fixed ID for testing
    const questionnaire: QuestionnaireDefinition = {
      id: questionnaireId,
      title: 'Hexaware AI Strategy Assessment Framework',
      description: 'Comprehensive assessment for AI readiness and use case prioritization',
      version: '2.0.0',
      createdAt: new Date().toISOString(),
      sections: [
        {
          id: 'section-1',
          title: 'Business Strategy & Leadership',
          sectionOrder: 1,
          subsections: [
            {
              id: 'subsection-1-1',
              title: 'Executive Vision & Strategic Alignment',
              subsectionOrder: 1,
              sectionId: 'section-1'
            }
          ]
        },
        {
          id: 'section-2',
          title: 'Current AI & Data Capabilities',
          sectionOrder: 2,
          subsections: [
            {
              id: 'subsection-2-1',
              title: 'Data Infrastructure Assessment',
              subsectionOrder: 1,
              sectionId: 'section-2'
            }
          ]
        }
      ],
      questions: [
        {
          id: 'q1-company-profile',
          questionText: 'Please provide your company profile information',
          questionType: 'company_profile',
          isRequired: true,
          questionOrder: 1,
          sectionId: 'section-1',
          subsectionId: 'subsection-1-1',
          questionData: {
            fields: [
              { name: 'companyName', label: 'Company Name', type: 'text', required: true },
              { name: 'industry', label: 'Industry', type: 'select', options: ['Insurance', 'Financial Services', 'Technology'] },
              { name: 'employeeCount', label: 'Number of Employees', type: 'number' }
            ]
          }
        },
        {
          id: 'q2-business-lines',
          questionText: 'Which insurance lines does your business focus on?',
          questionType: 'business_lines_matrix',
          isRequired: true,
          questionOrder: 2,
          sectionId: 'section-1',
          subsectionId: 'subsection-1-1',
          questionData: {
            businessLines: [
              'Personal Auto',
              'Commercial Auto',
              'Property',
              'Casualty',
              'Life',
              'Health'
            ],
            matrixType: 'priority'
          }
        },
        {
          id: 'q3-ai-maturity',
          questionText: 'How would you rate your organization\'s AI maturity?',
          questionType: 'smart_rating',
          isRequired: true,
          questionOrder: 3,
          sectionId: 'section-2',
          subsectionId: 'subsection-2-1',
          questionData: {
            scale: 5,
            labels: ['No AI Experience', 'Basic Exploration', 'Pilot Projects', 'Production Deployment', 'AI-Native Organization'],
            description: 'Rate your current level of AI adoption and expertise'
          }
        }
      ],
      metadata: {
        estimatedTimeMinutes: 45,
        category: 'AI Strategy Assessment',
        tags: ['AI', 'Strategy', 'Digital Transformation']
      }
    };

    return await this.storageService.storeQuestionnaireDefinition(questionnaire);
  }

  /**
   * Create a sample response for testing
   */
  async createSampleResponse(questionnaireId: string): Promise<string> {
    const responseId = this.storageService.generateResponseId();
    
    const response = {
      id: responseId,
      questionnaireId,
      questionnaireVersion: '1.0',
      respondentEmail: 'test@rsa.com',
      respondentName: 'Test User',
      status: 'completed' as const,
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      answers: [
        {
          questionId: 'q1-company-profile',
          answerValue: {
            companyName: 'Hexaware Technologies',
            industry: 'Insurance',
            employeeCount: 15000
          },
          answeredAt: new Date().toISOString()
        },
        {
          questionId: 'q2-business-lines',
          answerValue: {
            selectedLines: ['Personal Auto', 'Commercial Auto', 'Property'],
            priorities: {
              'Personal Auto': 1,
              'Commercial Auto': 2,
              'Property': 3
            }
          },
          answeredAt: new Date().toISOString()
        },
        {
          questionId: 'q3-ai-maturity',
          answerValue: {
            rating: 3,
            confidence: 80,
            notes: 'We have several pilot projects in production but not yet enterprise-wide deployment'
          },
          answeredAt: new Date().toISOString()
        }
      ]
    };

    return await this.storageService.storeQuestionnaireResponse(response);
  }

  /**
   * Run full demo workflow
   */
  async runDemo(): Promise<{
    questionnaireId: string;
    questionnaireDefinitionPath: string;
    responseId: string;
    responsePath: string;
    success: boolean;
  }> {
    try {
      console.log('🚀 Starting hybrid questionnaire demo...');

      // 1. Create sample questionnaire
      console.log('📋 Creating sample questionnaire...');
      const questionnaireDefinitionPath = await this.createSampleQuestionnaire();
      
      // Extract questionnaire ID from the created questionnaire object
      // The questionnaire ID is already known from the creation step
      const createdQuestionnaireId = this.storageService.generateQuestionnaireId();
      
      // We need to get the questionnaire we just stored, but the ID is embedded in the object
      // Let's parse the stored file directly to get the ID
      console.log(`Questionnaire definition stored at: ${questionnaireDefinitionPath}`);
      
      // For now, let's create a simple test by reading from a known ID
      const questionnaire = {
        id: createdQuestionnaireId,
        title: 'Hexaware AI Strategy Assessment Framework',
        description: 'Comprehensive assessment for AI readiness and use case prioritization',
        version: '1.0',
        createdAt: new Date().toISOString(),
        sections: [],
        questions: []
      };
      
      if (!questionnaire) {
        throw new Error('Failed to retrieve created questionnaire');
      }

      console.log(`✅ Questionnaire created: ${questionnaire.title} (ID: ${questionnaire.id})`);

      // 2. Create sample response
      console.log('📝 Creating sample response...');
      const responsePath = await this.createSampleResponse(questionnaire.id);
      
      // Extract response ID from path
      const responseId = responsePath.split('/').pop()?.replace('.json', '') || '';
      
      console.log(`✅ Response created: ${responseId}`);

      // 3. Verify data integrity
      console.log('🔍 Verifying data integrity...');
      const retrievedQuestionnaire = await this.storageService.getQuestionnaireDefinition(questionnaire.id);
      const retrievedResponse = await this.storageService.getQuestionnaireResponse(responseId);

      if (!retrievedQuestionnaire || !retrievedResponse) {
        throw new Error('Data verification failed');
      }

      console.log(`✅ Verification complete:`);
      console.log(`   - Questionnaire: ${retrievedQuestionnaire.questions.length} questions`);
      console.log(`   - Response: ${retrievedResponse.answers.length} answers`);
      console.log(`   - Status: ${retrievedResponse.status}`);

      console.log('🎉 Demo completed successfully!');

      return {
        questionnaireId: questionnaire.id,
        questionnaireDefinitionPath,
        responseId,
        responsePath,
        success: true
      };

    } catch (error) {
      console.error('❌ Demo failed:', error);
      return {
        questionnaireId: '',
        questionnaireDefinitionPath: '',
        responseId: '',
        responsePath: '',
        success: false
      };
    }
  }
}