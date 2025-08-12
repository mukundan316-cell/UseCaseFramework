import React from 'react';
import { Survey } from 'survey-react-ui';
import { Model } from 'survey-core';

interface SurveyWrapperProps {
  surveyModel: Model;
}

// Memoized Survey wrapper to prevent unnecessary re-renders
export const SurveyWrapper = React.memo(({ surveyModel }: SurveyWrapperProps) => {
  return <Survey model={surveyModel} />;
});

SurveyWrapper.displayName = 'SurveyWrapper';