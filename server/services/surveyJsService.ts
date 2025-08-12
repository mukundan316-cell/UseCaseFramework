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
      // For now, use a simple hardcoded config based on the user's attached file
      const surveyConfig = {
        id: "surveyjs-assessment",
        title: "RSA AI Strategy Assessment (Survey.js)",
        description: "Enhanced assessment powered by Survey.js library",
        showProgressBar: "top",
        progressBarType: "questions",
        questionTitleLocation: "top",
        questionsOnPageMode: "singlePage",
        showQuestionNumbers: "off",
        completeText: "Complete Assessment",
        pageNextText: "Next Section",
        pagePrevText: "Previous Section",
        pages: [
          {
            name: "page1",
            title: "1.1 Company Profile & Business Context",
            elements: [
              {
                type: "panel",
                name: "companyProfilePanel",
                title: "Q1. Company Profile",
                elements: [
                  {
                    type: "text",
                    name: "companyName",
                    title: "Company Name",
                    isRequired: true
                  },
                  {
                    type: "text",
                    name: "gwp",
                    title: "Gross Written Premium (GWP) in millions",
                    inputType: "number",
                    isRequired: true
                  },
                  {
                    type: "radiogroup",
                    name: "companyTier",
                    title: "Company Tier",
                    isRequired: true,
                    choices: [
                      { value: "small", text: "Small (Under $100M GWP)" },
                      { value: "mid", text: "Mid ($100M-$3B GWP)" },
                      { value: "large", text: "Large (Over $3B GWP)" }
                    ]
                  },
                  {
                    type: "checkbox",
                    name: "primaryMarkets",
                    title: "Primary Markets",
                    isRequired: true,
                    choices: [
                      { value: "personal", text: "Personal Lines" },
                      { value: "commercial", text: "Commercial Lines" },
                      { value: "specialty", text: "Specialty" },
                      { value: "reinsurance", text: "Reinsurance" }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      return surveyConfig;
    } catch (error) {
      console.error('Failed to load Survey.js config:', error);
      throw error;
    }
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