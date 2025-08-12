import { useParams } from 'wouter';
import { SurveyJsContainer } from '@/components/SurveyJsContainer';

export default function SurveyJsAssessment() {
  const { questionnaireId } = useParams<{ questionnaireId: string }>();
  
  if (!questionnaireId) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Questionnaire</h1>
          <p className="text-gray-600">No questionnaire ID provided.</p>
        </div>
      </div>
    );
  }

  return <SurveyJsContainer questionnaireId={questionnaireId} />;
}