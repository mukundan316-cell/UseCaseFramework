import { QuestionnaireService } from './questionnaireService';

/**
 * Service to bridge Survey.js with our existing questionnaire infrastructure
 */
export class SurveyJsService extends QuestionnaireService {
  /**
   * Load Survey.js configuration from JSON file
   */
  async loadSurveyJsConfig(configId: string): Promise<any> {
    try {
      // Load Survey.js configuration from JSON file
      const config = await this.getQuestionnaireDefinition(configId);
      
      if (!config) {
        throw new Error(`Survey.js configuration not found for ID: ${configId}`);
      }

      return config;
    } catch (error) {
      console.error('Failed to load Survey.js config:', error);
      throw error;
    }
  }

  /**
   * Convert Survey.js configuration to legacy questionnaire format for metadata
   */
  convertSurveyJsToQuestionnaireMetadata(surveyConfig: any): any {
    if (!surveyConfig || !surveyConfig.pages) {
      return null;
    }

    const sections = surveyConfig.pages.map((page: any, index: number) => {
      const questions = this.extractQuestionsFromPage(page);
      
      return {
        id: page.name || `section-${index + 1}`,
        title: page.title || `Section ${index + 1}`,
        description: page.description || `Assessment section covering ${page.title || 'various topics'}`,
        sectionOrder: index + 1,
        questions: questions
      };
    });

    return {
      id: surveyConfig.id,
      title: surveyConfig.title,
      description: surveyConfig.description,
      version: surveyConfig.version || '2.0.0',
      sections: sections
    };
  }

  /**
   * Extract questions from Survey.js page elements recursively
   */
  private extractQuestionsFromPage(page: any): any[] {
    const questions: any[] = [];
    let questionOrder = 1;

    const processElements = (elements: any[], parentTitle = '') => {
      elements.forEach((element: any) => {
        if (element.type === 'panel' && element.elements) {
          // Recursively process panel elements
          processElements(element.elements, element.title || '');
        } else if (this.isQuestionElement(element)) {
          // Convert Survey.js element to legacy question format
          questions.push({
            id: element.name,
            questionText: element.title,
            questionType: this.mapSurveyJsTypeToLegacy(element.type),
            isRequired: element.isRequired || false,
            questionOrder: questionOrder++,
            helpText: element.description,
            options: element.choices?.map((choice: any) => ({
              id: choice.value,
              label: choice.text
            }))
          });
        }
      });
    };

    if (page.elements) {
      processElements(page.elements);
    }

    return questions;
  }

  /**
   * Check if element is a question (not just a panel)
   */
  private isQuestionElement(element: any): boolean {
    const questionTypes = ['text', 'radiogroup', 'checkbox', 'rating', 'comment', 'dropdown', 'boolean'];
    return questionTypes.includes(element.type);
  }

  /**
   * Map Survey.js question types to legacy types
   */
  private mapSurveyJsTypeToLegacy(type: string): string {
    const typeMapping: { [key: string]: string } = {
      'text': 'text',
      'radiogroup': 'radio',
      'checkbox': 'checkbox',
      'rating': 'smart_rating',
      'comment': 'textarea',
      'dropdown': 'select',
      'boolean': 'radio'
    };
    return typeMapping[type] || 'text';
  }

  /**
   * Convert Survey.js data format to our response format
   */
  convertSurveyJsToAnswers(surveyData: any): any[] {
    const answers: any[] = [];
    
    Object.keys(surveyData).forEach(questionName => {
      const value = surveyData[questionName];
      if (value !== undefined && value !== null && value !== '') {
        answers.push({
          questionId: questionName,
          answerValue: JSON.stringify(value),
          score: null
        });
      }
    });

    return answers;
  }

  /**
   * Convert our answer format to Survey.js data format
   */
  convertAnswersToSurveyJs(answers: any[]): any {
    const surveyData: any = {};
    
    if (Array.isArray(answers)) {
      answers.forEach(answer => {
        try {
          if (answer.questionId && answer.answerValue !== undefined) {
            // Try to parse JSON, fallback to string value
            try {
              surveyData[answer.questionId] = JSON.parse(answer.answerValue);
            } catch {
              surveyData[answer.questionId] = answer.answerValue;
            }
          }
        } catch (error) {
          console.warn('Error converting answer:', answer, error);
        }
      });
    }

    return surveyData;
  }

  /**
   * Save Survey.js answers (override parent method)
   */
  async saveResponseAnswers(responseId: string, surveyData: any): Promise<boolean> {
    try {
      // Convert Survey.js format to our format
      const answers = this.convertSurveyJsToAnswers(surveyData);
      
      // Use parent method with converted data
      return await super.saveResponseAnswers(responseId, answers);
    } catch (error) {
      console.error('Failed to save Survey.js answers:', error);
      return false;
    }
  }

  /**
   * Get response in Survey.js format
   */
  async getResponseForSurveyJs(responseId: string): Promise<any> {
    try {
      const response = await this.getResponse(responseId);
      if (!response || !response.answers) {
        return {};
      }

      return this.convertAnswersToSurveyJs(response.answers);
    } catch (error) {
      console.error('Failed to get Survey.js response:', error);
      return {};
    }
  }
}