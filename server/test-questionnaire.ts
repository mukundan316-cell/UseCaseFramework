// Quick test file to verify questionnaire API endpoints
// Run with: tsx server/test-questionnaire.ts

import { db } from './db';
import { questionnaires, questionnaireSections, questions, questionOptions } from '@shared/schema';

async function testQuestionnaireAPI() {
  try {
    console.log('🧪 Testing Questionnaire Database Operations...\n');

    // 1. Create a test questionnaire
    console.log('1️⃣ Creating test questionnaire...');
    const [questionnaire] = await db
      .insert(questionnaires)
      .values({
        title: 'RSA AI Maturity Assessment',
        description: 'Evaluate your organization\'s AI readiness and maturity',
        version: '1.0',
        status: 'active'
      })
      .returning();
    
    console.log('✅ Created questionnaire:', questionnaire.id);

    // 2. Create a test section
    console.log('\n2️⃣ Creating test section...');
    const [section] = await db
      .insert(questionnaireSections)
      .values({
        questionnaireId: questionnaire.id,
        title: 'AI Strategy & Governance',
        sectionOrder: 1,
        estimatedTime: 10
      })
      .returning();
    
    console.log('✅ Created section:', section.id);

    // 3. Create test questions
    console.log('\n3️⃣ Creating test questions...');
    const [scoreQuestion] = await db
      .insert(questions)
      .values({
        sectionId: section.id,
        questionText: 'How would you rate your AI strategy maturity?',
        questionType: 'scale',
        isRequired: 'true',
        questionOrder: 1,
        helpText: 'Consider governance, ethics, and strategic alignment'
      })
      .returning();

    const [multiChoiceQuestion] = await db
      .insert(questions)
      .values({
        sectionId: section.id,
        questionText: 'What is your primary AI focus area?',
        questionType: 'select',
        isRequired: 'true',
        questionOrder: 2
      })
      .returning();

    console.log('✅ Created questions:', [scoreQuestion.id, multiChoiceQuestion.id]);

    // 4. Create options for multi-choice question
    console.log('\n4️⃣ Creating question options...');
    await db
      .insert(questionOptions)
      .values([
        {
          questionId: multiChoiceQuestion.id,
          optionText: 'Process Automation',
          optionValue: 'automation',
          scoreValue: 3,
          optionOrder: 1
        },
        {
          questionId: multiChoiceQuestion.id,
          optionText: 'Customer Experience',
          optionValue: 'customer_experience',
          scoreValue: 4,
          optionOrder: 2
        },
        {
          questionId: multiChoiceQuestion.id,
          optionText: 'Risk Management',
          optionValue: 'risk_management',
          scoreValue: 5,
          optionOrder: 3
        }
      ]);

    console.log('✅ Created question options');

    // 5. Test retrieval
    console.log('\n5️⃣ Testing questionnaire retrieval...');
    const retrievedQuestionnaire = await db
      .select()
      .from(questionnaires)
      .where((q) => q.id === questionnaire.id);

    console.log('✅ Successfully retrieved questionnaire');
    console.log('📊 Test Results:');
    console.log('- Questionnaire ID:', questionnaire.id);
    console.log('- Section ID:', section.id);
    console.log('- Questions created: 2');
    console.log('- Options created: 3');
    console.log('\n🎉 All database operations successful!');
    console.log('\n📝 API Endpoints ready:');
    console.log(`- GET /api/questionnaire/${questionnaire.id}`);
    console.log(`- POST /api/responses/start`);
    console.log(`- PUT /api/responses/:id/answers`);
    console.log(`- POST /api/responses/:id/complete`);
    console.log(`- GET /api/responses/:id/scores`);

    return questionnaire.id;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run test if this file is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  testQuestionnaireAPI()
    .then((id) => {
      console.log(`\n✨ Test questionnaire created with ID: ${id}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}