import GovernanceGuideLegoBlock from '../GovernanceGuideLegoBlock';
import type { GuideTabProps } from './types';

export default function GuideTab({ governanceStatus }: GuideTabProps) {
  return (
    <GovernanceGuideLegoBlock
      currentGates={{
        operatingModel: governanceStatus.operatingModel.passed,
        intake: governanceStatus.intake.passed,
        rai: governanceStatus.rai.passed,
        activation: governanceStatus.operatingModel.passed && governanceStatus.intake.passed && governanceStatus.rai.passed
      }}
    />
  );
}
